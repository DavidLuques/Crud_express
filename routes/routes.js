const express = require('express')
const router = express.Router()
const User = require('../models/userss')
const multer = require('multer')
const fs = require('fs')

//configurando muler para uplaod files jej
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')  // where files will be stored hehe... 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname) // Nombre de archivo unicoas
    }
})
const upload = multer({
    storage: storage,
})

router.get('/add', (req, res) => {
    res.render('add_users', {
        title: 'home page',
    })
})

router.post('/add', upload.single('file'), (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename // Cambio en esta línea
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully'
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Error de Multer
        res.status(400).json({ message: err.message, type: 'danger' });
    } else {
        // Otro tipo de error
        res.status(500).json({ message: 'Error interno del servidor', type: 'danger' });
    }
});

//get all users route   
router.get('/', (req, res) => {
    User.find().exec()
        .then((users) => {
            res.render('index', {
                title: 'home page',
                users: users
            });
        })
        .catch((err) => {
            res.json({ message: err.message });
        });
    console.log('entraste a home');
});

router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    User.findById(id)
        .then((user) => {
            if (!user) {
                res.redirect('/');
            } else {
                console.log('/edit/:id')
                res.render('edit_users', {
                    title: 'edit_users',
                    user: user
                });
            }
        })
        .catch((err) => {
            console.error(err);
            res.redirect('/');
        });
})

//update userr

router.post('/update/:id', upload.single('file'), async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    console.log('Estás en /update/id y el id que viene es ' + id);

    if (req.file) {
        new_image = req.file.filename;
        console.log('req.file tiene algo');
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
        console.log('req.file es undefined');
    }

    try {
        console.log('Estoy en updateDocument');
        const updatedResult = await User.findByIdAndUpdate(
            { _id: id },
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image,
            },
            {
                new: true,
            }
        );

        // Verifica si hubo errores en la actualización
        if (!updatedResult) {
            return res.json({ message: 'No se pudo encontrar el usuario para actualizar.', type: 'danger' });
        }

        req.session.message = {
            type: 'success',
            message: 'Usuario actualizado exitosamente',
        };
        res.redirect('/');
        console.log(updatedResult);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message, type: 'danger' });
    }
});

//delete user
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (user.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }

        await User.findOneAndDelete({ _id: id }); // Usamos findOneAndDelete en lugar de findByIdAndRemove

        req.session.message = {
            type: 'success',
            message: 'User deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;
