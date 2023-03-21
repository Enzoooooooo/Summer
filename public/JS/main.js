const userId = localStorage.getItem('userId');
if (userId) {
    fetchGroups(userId);
} else {
    console.error("Erreur: L'ID utilisateur est introuvable");
}

let currentActivityIndex = 0;
let selectedGroupId = null;
let activities = [];

function showActivityByIndex(activities) {
    if (activities.length === 0) {
        return;
    }

    currentActivityIndex = currentActivityIndex % activities.length;
    const activity = activities[currentActivityIndex];
    displayActivity(activity);
}

function displayGroups(groups) {
    const groupsList = document.getElementById('groups-list');
    groupsList.innerHTML = '';

    for (const group of groups) {
        const groupItem = document.createElement('li');
        groupItem.classList.add('group-item');

        const groupName = document.createElement('h3');
        groupName.textContent = group.name;
        groupItem.appendChild(groupName);

        const groupInfo = document.createElement('p');
        groupInfo.textContent = `Nombre de personnes : ${group.numberOfPeople}, Ville : ${group.city}, Budget : ${group.budget}`;
        groupItem.appendChild(groupInfo);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.classList.add('delete-button');
        deleteButton.dataset.groupId = group._id;
        deleteButton.addEventListener('click', () => {
            deleteGroup(deleteButton.dataset.groupId);
        });
        groupItem.appendChild(deleteButton);

        const groupInfoContainer = document.createElement('div');
        groupInfoContainer.classList.add('group-info-container');
        groupItem.appendChild(groupInfoContainer);

        groupInfoContainer.appendChild(groupName);
        groupInfoContainer.appendChild(groupInfo);

        groupInfoContainer.addEventListener('click', () => {
            fetchActivities(group.city);
        });
        groupsList.appendChild(groupItem);
        groupInfoContainer.dataset.groupId = group._id;
        groupItem.addEventListener('click', () => {
            fetchActivities(group.city);
            selectedGroupId = group._id;
        });
    }
}

function displayActivity(activity) {
    const swipeContainer = document.getElementById('swipe-container');
    swipeContainer.innerHTML = '';

    const activityItem = document.createElement('div');
    activityItem.classList.add('activity-item', 'swiper-slide');

    const activityName = document.createElement('h4');
    activityName.textContent = activity.name;
    activityItem.appendChild(activityName);

    const activityImage = document.createElement('img');
    activityImage.src = activity.image_url;
    activityImage.alt = activity.name;
    activityImage.classList.add('activity-image');
    activityItem.appendChild(activityImage);

    swipeContainer.appendChild(activityItem);
}

function displayActivities(activities) {
    const swiperContainer = document.querySelector(".swiper-container");

    if (activities.length > 0) {
        swiperContainer.classList.remove("hidden");
    } else {
        swiperContainer.classList.add("hidden");
    }

    showActivityByIndex(activities);
}

async function fetchActivities(city) {
    try {
        const response = await axios.get('/activities/' + city);
        activities = response.data; // Mettez à jour la valeur de la variable 'activities' ici
        console.log(activities); // Ajoutez cette ligne pour vérifier les données récupérées
        displayActivities(activities);
        return activities;
    } catch (error) {
        console.error('Erreur lors de la récupération des activités', error);
        return [];
    }
}

async function fetchGroups() {
    const userId = localStorage.getItem('userId');
    try {
        const response = await fetch(`/groups/${userId}/all`);
        if (response.ok) {
            const groups = await response.json();
            displayGroups(groups);
        } else {
            console.error('Erreur lors de la récupération des groupes', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des groupes', error);
    }
}

async function deleteGroup(groupId) {
    try {
        const response = await fetch(`/groups/${groupId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchGroups();
        } else {
            console.error('Erreur lors de la suppression du groupe', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du groupe', error);
    }
}


document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = '/HTML/login.html';
});

document.getElementById('new-group').addEventListener('click', () => {
    document.getElementById('group-form-container').style.display = 'flex';
});

document.getElementById('cancel-form').addEventListener('click', () => {
    document.getElementById('group-form-container').style.display = 'none';
});

document.getElementById('group-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const groupName = document.getElementById('group-name').value;
    const numberOfPeople = document.getElementById('group-people').value;
    const city = document.getElementById('group-city').value;
    const budget = document.getElementById('group-budget').value;
    try {
        await fetch('/groups', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, groupName, numberOfPeople, city, budget}),
        });

        document.getElementById('group-form-container').style.display = 'none';
        fetchGroups();
    } catch (error) {
        console.error('Erreur lors de la création du groupe', error);
    }
});

document.getElementById('like-button').addEventListener('click', () => {
    currentActivityIndex++;
    showActivityByIndex(activities);
});

document.getElementById('dislike-button').addEventListener('click', () => {
    currentActivityIndex++;
    showActivityByIndex(activities);
});

document.getElementById('add-friend').addEventListener('click', () => {
    document.getElementById('friend-form-container').style.display = 'flex';
});

document.getElementById('cancel-friend-form').addEventListener('click', () => {
    document.getElementById('friend-form-container').style.display = 'none';
});

document.getElementById('friend-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const friendEmail = document.getElementById('friend-email').value;
    const groupId = selectedGroupId;

    try {
        await axios.post(`/groups/${groupId}/add-friend`, { email: friendEmail });
        document.getElementById('friend-form-container').style.display = 'none';
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un ami au groupe", error);
    }
});
