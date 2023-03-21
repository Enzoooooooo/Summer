const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
    const googlePlacesAPIKey = 'AIzaSyAjYLLVaNBTzOi-9Ibq_G5BUIM6ZMZSKQo';

async function fetchGooglePlacesActivities(city) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                key: googlePlacesAPIKey,
                query: `activités à ${city}`,
                type: 'tourist_attraction'
            }
        });

        return response.data.results;
    } catch (error) {
        console.error('Erreur lors de la récupération des activités Google Places', error);
        return [];
    }
}

function formatGooglePlacesActivities(activities) {
    return activities.map(activity => ({
        name: activity.name,
        image_url: activity.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photoreference=${activity.photos[0].photo_reference}&key=${googlePlacesAPIKey}` : '',
        rating: activity.rating || 'Non disponible',
        location: {
            address1: activity.formatted_address,
            city: activity.plus_code.compound_code.split(', ')[1],
            zip_code: '',
        },
        categories: [{ title: activity.types[0] }],
    }));
}

mongoose.connect('mongodb+srv://enleroux:G8M91O876qtdjw1y@summerdb.0v0ywp0.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connexion à MongoDB réussie'))
    .catch((err) => console.error('Erreur de connexion à MongoDB', err));

const express = require('express');
const User = require('./public/JS/user');
const Group = require('./public/JS/group');
const axios = require('axios');
const app = express();
const path = require('path');

app.use(express.json());

app.post('/signup', async (req, res) => {
    const {firstName, lastName, age, email, password} = req.body;

    // Valider les données reçues (vous pouvez ajouter des validations supplémentaires)
    if (!firstName || !lastName || !age || !email || !password) {
        return res.status(400).json({message: 'Tous les champs sont obligatoires'});
    }

    try {
        // Vérifier si l'email existe déjà dans la base de données
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: 'Un utilisateur avec cet e-mail existe déjà'});
        }// Ajouter l'utilisateur à la base de données
        const newUser = new User({firstName, lastName, age, email, password});
        await newUser.save();

// Envoyer une réponse appropriée
        res.status(201).json({message: 'Utilisateur créé avec succès'});
    } catch (error) {
        console.error('Erreur lors de la création de l utilisateur', error);
        res.status(500).json({message: 'Erreur lors de la création de l utilisateur'});
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    // Vérifiez si l'utilisateur existe dans la base de données
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'Email ou mot de passe incorrect'});
        }

        // Vérifiez si le mot de passe est correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message: 'Email ou mot de passe incorrect'});
        }

        // Si tout va bien, envoyez une réponse de succès
        res.status(200).json({message: 'Connexion réussie', userId: user._id});
    } catch (error) {
        console.error('Erreur lors de la connexion de l\'utilisateur', error);
        res.status(500).json({message: 'Erreur interne du serveur'});
    }
});
// Route pour créer un nouveau groupe
app.post('/groups', async (req, res) => {
    const { userId, groupName, numberOfPeople, city, budget } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const newGroup = new Group({ name: groupName, user: userId, numberOfPeople, city, budget });
        await newGroup.save();

        res.status(201).json({ message: 'Groupe créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la création du groupe', error);
        res.status(500).json({ message: 'Erreur lors de la création du groupe' });
    }
});
// Route pour récupérer les groupes d'un utilisateur
app.get('/groups/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const groups = await Group.find({user: userId});
        res.status(200).json(groups);
    } catch (error) {
        console.error('Erreur lors de la récupération des groupes', error);
        res.status(500).json({message: 'Erreur lors de la récupération des groupes'});
    }
});

app.delete('/groups/:groupId', async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }

        await Group.deleteOne({ _id: groupId }); // Modifiez cette ligne

        res.status(200).json({ message: 'Groupe supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du groupe', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du groupe' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('./HTML/login.html');
});

app.get('/activities/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const googlePlacesActivities = await fetchGooglePlacesActivities(city);

        const formattedActivities = formatGooglePlacesActivities(googlePlacesActivities);
        const shuffledActivities = formattedActivities.sort(() => Math.random() - 0.5);

        res.json(shuffledActivities);
    } catch (error) {
        console.error('Erreur lors de la récupération des activités', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des activités' });
    }
});


app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
