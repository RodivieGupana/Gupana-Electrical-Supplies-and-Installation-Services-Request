const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { logActivity } = require('../config/helpers');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);


// GET /api/users?role=client&search=
router.get('/', requireRole('admin'), async (req, res) => {

  try {

    const { role, search } = req.query;

    const conditions = [];
    const params = [];


    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }


    if (search) {

      params.push(`%${search}%`);

      conditions.push(`
        (
          full_name ILIKE $${params.length}
          OR email ILIKE $${params.length}
          OR phone_number ILIKE $${params.length}
          OR address ILIKE $${params.length}
        )
      `);

    }


    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';



    const { rows } = await pool.query(
      `
      SELECT
        user_id,
        role,
        full_name,
        email,
        phone_number,
        address,
        status,
        created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      `,
      params
    );


    res.json(rows);


  } catch(error){

    console.error(error);

    res.status(500).json({
      error:'Failed to fetch users.'
    });

  }

});




// GET /api/users/:id
router.get('/:id', async (req,res)=>{

  try{

    if(
      req.user.role !== 'admin' &&
      req.user.user_id !== Number(req.params.id)
    ){
      return res.status(403).json({
        error:'Not allowed.'
      });
    }



    const {rows}=await pool.query(
      `
      SELECT
        user_id,
        role,
        full_name,
        email,
        phone_number,
        address,
        avatar_url,
        status,
        created_at
      FROM users
      WHERE user_id=$1
      `,
      [
        req.params.id
      ]
    );



    if(!rows[0]){
      return res.status(404).json({
        error:'User not found.'
      });
    }


    res.json(rows[0]);



  }catch(error){

    console.error(error);

    res.status(500).json({
      error:'Failed to fetch user.'
    });

  }

});





// UPDATE USER PROFILE
router.put('/:id', async(req,res)=>{

  try{


    const targetId = Number(req.params.id);


    if(
      req.user.role !== 'admin' &&
      req.user.user_id !== targetId
    ){

      return res.status(403).json({
        error:'Not allowed.'
      });

    }



    const {
      full_name,
      phone_number,
      address,
      avatar_url,
      status
    } = req.body;



    const fields=[];
    const params=[];

    let index=1;



    for(const [key,value] of Object.entries({

      full_name,
      phone_number,
      address,
      avatar_url

    })){

      if(value !== undefined){

        fields.push(`${key}=$${index}`);

        params.push(value);

        index++;

      }

    }



    if(status !== undefined && req.user.role==='admin'){

      fields.push(`status=$${index}`);

      params.push(status);

      index++;

    }



    if(!fields.length){

      return res.status(400).json({
        error:'No fields to update.'
      });

    }



    params.push(targetId);



    const {rows}=await pool.query(

      `
      UPDATE users
      SET ${fields.join(',')}
      WHERE user_id=$${index}

      RETURNING
        user_id,
        role,
        full_name,
        email,
        phone_number,
        address,
        status
      `,

      params

    );



    if(req.user.role==='admin'){

      await logActivity(
        req.user.user_id,
        `Updated user #${targetId}`,
        'Users'
      );

    }



    res.json(rows[0]);



  }catch(error){

    console.error(error);

    res.status(500).json({
      error:'Failed to update user.'
    });

  }

});






// CHANGE PASSWORD
router.put('/:id/password', async(req,res)=>{


  try{


    const targetId=Number(req.params.id);


    if(
      req.user.role !== 'admin' &&
      req.user.user_id !== targetId
    ){

      return res.status(403).json({
        error:'Not allowed.'
      });

    }



    const {password}=req.body;


    if(!password || password.length < 6){

      return res.status(400).json({
        error:'Password must be at least 6 characters.'
      });

    }



    const hash = await bcrypt.hash(password,10);



    await pool.query(

      `
      UPDATE users
      SET password_hash=$1
      WHERE user_id=$2
      `,
      [
        hash,
        targetId
      ]

    );



    res.json({
      success:true
    });



  }catch(error){

    console.error(error);

    res.status(500).json({
      error:'Failed to change password.'
    });

  }

});







// DELETE USER
router.delete('/:id',requireRole('admin'),async(req,res)=>{


  try{


    await pool.query(

      `
      DELETE FROM users
      WHERE user_id=$1
      `,
      [
        req.params.id
      ]

    );



    await logActivity(
      req.user.user_id,
      `Deleted user #${req.params.id}`,
      'Users'
    );



    res.json({
      success:true
    });



  }catch(error){

    console.error(error);

    res.status(500).json({
      error:'Failed to delete user.'
    });

  }

});





module.exports = router;