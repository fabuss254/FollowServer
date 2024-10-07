const Express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = Express();

const ListOfFollowers = new Set();

// FUNCTIONS

function Save() {
    console.log("SAVING !!")

    if (!fs.existsSync('followers.json')) fs.writeFileSync('followers.json', JSON.stringify([]));
    fs.writeFileSync('followers.json', JSON.stringify([...ListOfFollowers]));
}

function Load() {
    if (!fs.existsSync('followers.json')) fs.writeFileSync('followers.json', JSON.stringify([]));
    const Data = fs.readFileSync('followers.json');
    const Followers = JSON.parse(Data);
    Followers.forEach((Follower) => {
        ListOfFollowers.add(Follower);
    });
}

function IsFollowing(UserId) {
    return ListOfFollowers.has(UserId);
}

// RUNNERS

app.get('/:id', (req, res) => {
    const UserIdToCheck = parseInt(req.params.id);
    if (!UserIdToCheck || UserIdToCheck == 0) return res.status(400).send('No user id provided');
    if (UserIdToCheck == NaN) return res.status(400).send('Invalid user id');
    if (IsFollowing(UserIdToCheck)) return res.status(200).send('true');

    res.status(200).send('false');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

Load();
setInterval(async () => {
    let HasNewFollowers = false;
    const response = await axios.get("https://friends.roblox.com/v1/users/52368542/followers?limit=25&sortOrder=Desc")
    if (response.status !== 200) return console.log("Failed to get followers");
    const NewFollowers = response.data.data;
    for (let i = 0; i < NewFollowers.length; i++) {
        const Follower = NewFollowers[i];
        if (!IsFollowing(Follower.id)) {
            console.log(`New follower: ${Follower.id}`);
            ListOfFollowers.add(Follower.id, true);

            HasNewFollowers = true;
        }
    }

    if (HasNewFollowers) Save();
}, 15 * 1000);