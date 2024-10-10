const Express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = Express();

const ListOfFollowers = new Set();

let CurrentLikes = 0;
let CurrentMaxLikes = 0;
const LikeMilestones = [
    ["100Likes", 100],
    ["200Likes", 200],
    ["500Likes", 500],
    ["1KLikes", 1_000],
    ["2KLikes", 2_000],
    ["5KLikes", 5_000],
    ["10KLikes", 10_000],
    ["20KLikes", 20_000],
    ["50KLikes", 50_000],
    ["100KLikes", 100_000],
    ["200KLikes", 200_000],
    ["500KLikes", 500_000],
    ["1MLikes", 1_000_000],
    ["2MLikes", 2_000_000],
    ["5MLikes", 5_000_000],
    ["10MLikes", 10_000_000],
    ["20MLikes", 20_000_000],
    ["50MLikes", 50_000_000],
]


// FUNCTIONS

function RegisterMaxLike(LikeAmout) {
    if (CurrentMaxLikes >= LikeAmout) return;
    CurrentMaxLikes = LikeAmout;

    if (!fs.existsSync('like.txt')) fs.writeFileSync('like.txt', "0");
    fs.writeFileSync('like.txt', CurrentMaxLikes.toString());
}

function LoadMaxLike() {
    if (!fs.existsSync('like.txt')) fs.writeFileSync('like.txt', "0");
    const Data = fs.readFileSync('like.txt');
    CurrentMaxLikes = parseInt(Data);
    CurrentLikes = CurrentMaxLikes;
}

function GetCurrentLikeMilestone() {
    let Code = ""
    for (let i = 0; i < LikeMilestones.length; i++) {
        const ThisMilestone = LikeMilestones[i];
        if (CurrentMaxLikes > ThisMilestone[1]) Code = ThisMilestone[0];
    }
    return Code;
}

function GetNextLikeMilestone() {
    for (let i = 0; i < LikeMilestones.length; i++) {
        const ThisMilestone = LikeMilestones[i];
        if (CurrentMaxLikes < ThisMilestone[1]) return ThisMilestone[1];
    }
    return null;
}

function Save() {
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

app.get('/FollowCheck/:id', (req, res) => {
    const UserIdToCheck = parseInt(req.params.id);
    if (!UserIdToCheck || UserIdToCheck == 0) return res.status(400).send('No user id provided');
    if (UserIdToCheck == NaN) return res.status(400).send('Invalid user id');
    if (IsFollowing(UserIdToCheck)) return res.status(200).send('true');

    res.status(200).send('false');
});

app.get("/JHOLike", (req, res) => {
    res.status(200).send(`{"like":${CurrentLikes},"code":"${GetCurrentLikeMilestone()}","next":${GetNextLikeMilestone()}}`);
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
            console.log(`New follower: ${Follower.id} (${Follower.displayName} - @${Follower.name})`);
            ListOfFollowers.add(Follower.id, true);

            HasNewFollowers = true;
        }
    }

    if (HasNewFollowers) Save();
}, 7 * 1000);

LoadMaxLike();
setInterval(async () => {
    const response = await axios.get("https://games.roblox.com/v1/games/votes?universeIds=6573341621")
    if (response.status !== 200) return console.log("Failed to get followers");
    
    const Likes = response.data.data[0].upVotes;
    CurrentLikes = Likes;
    RegisterMaxLike(Likes);

}, 15 * 1000);