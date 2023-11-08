const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const router = express.Router();

// MongoDB connection URL
const url = 'mongodb://developer:uIfi3nWWSIDCL7Fw@3.7.124.168:27017/';
router.get('/projects', async (req, res) => {
    
  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('rps-prop');
    const collection = db.collection('projects_testing');

    const projection = {
        projection:{
            id: 1, 
            project_status:1,
            project_name:1,
            location_map:1,
            location_address:1,
            images: 1,
        }, 
        sort:{id:1}, 
        limit: 10
    };
    const filter = {
        published_in_web: true,
        project_status: { $in: ["Ready to Move", "Under Construction", "Booking in progress", "Booking near to end"] },
        project_name: {$exists: true}
    };

    const documents = await collection.find(filter, projection).toArray();

    client.close();

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while fetching documents.' });
  }
});

//MYSQL CONNECTION#########################################################
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'react_auth'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


//REGISTER#########################################################
router.post('/register', async (req, res) => {

  try {
    const { username, email, password, address } = req.body;

    const sql = 'INSERT INTO login_details (usernames, emails, passwords, addresss) values (?, ?, ?, ?)';
    const values = [username, email, password, address];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ success: false, message: 'Error saving data' });
      } else {
        console.log('Data saved successfully');
        res.status(200).json({ success: true, message: 'Data saved successfully' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something Went Wrong!!!' });
  }
});

//UPDATE#########################################################
router.put('/update', async (req, res) => {
    try {
        const { username, email, password, address, uid } = req.body;

        const sql = 'UPDATE login_details SET usernames = ?, emails = ?, passwords = ?, addresss = ? WHERE id = ?';
        const values = [username, email, password, address, uid];
        console.log(values);
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error updating data:', err);
                res.status(500).json({ success: false, message: 'Error updating data' });
            } else {
                if (result.affectedRows > 0) {
                    console.log('Data updated successfully');
                    res.status(200).json({ success: true, message: 'Data updated successfully' });
                } else {
                    res.status(404).json({ success: false, message: 'No records found to update' });
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Something Went Wrong!!!' });
    }
});


//FETCH DATA#########################################################
router.post('/fetchData', async (req, res) => {

    try {
        const { fetchType, uid } = req.body;

        let sql; // Declare the sql variable outside of the if blocks

        if (fetchType === 'single') {
            sql = 'SELECT * FROM login_details WHERE id = ?';
        }
        if (fetchType === 'all') {
            sql = 'SELECT * FROM login_details ORDER BY id';
        }

        connection.query(sql, [uid], (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).json({ success: false, message: 'Error fetching data' });
            } else {
                console.log('Data fetched successfully');
                res.status(200).json({ success: true, message: 'Data fetched', fetched_data: results });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Something Went Wrong!!!' });
    }
});

//DELETE DATA#########################################################
router.post('/deleteData', async (req, res) => {

    try {
        const { id } = req.body;

        const sql = 'DELETE FROM login_details WHERE id = ?';

        connection.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error deleting data:', err);
                res.status(500).json({ success: false, message: 'Error deleting data' });
            } else {
                if (result.affectedRows > 0) {
                    console.log('Data deleted successfully');
                    res.status(200).json({ success: true, message: 'Data deleted successfully' });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found for deletion' });
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Something Went Wrong!!!' });
    }
});


module.exports = router;
