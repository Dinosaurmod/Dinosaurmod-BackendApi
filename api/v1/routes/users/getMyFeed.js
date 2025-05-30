module.exports = (app, utils) => {
    app.get('/api/v1/users/getmyfeed', utils.cors(), async function (req, res) {
        const packet = req.query;


        const username = (String(packet.username)).toLowerCase();
        const token = packet.token;

        if (!username || !token) {
            utils.error(res, 400, "Missing username or token");
            return;
        }

        if (!await utils.UserManager.loginWithToken(username, token, true)) {
            utils.error(res, 401, "InvalidToken");
            return;
        }

        const feed = await utils.UserManager.getUserFeed(username, Number(utils.env.FeedSize));

        const final = []

        for (const item of feed) {
            switch (item.type) {
                case "follow":
                    item.data = {
                        id: item.data,
                        username: await utils.UserManager.getUsernameByID(item.data)
                    }
                    final.push(item);
                    break;
                case "upload":
                case "remix":
                    item.data = {
                        id: item.data,
                        name: (await utils.UserManager.getProjectMetadata(item.data)).title
                    }
                    final.push(item);
                    break;
                default:
                    final.push(item);
                    break;
            }
        }

        res.status(200);
        res.header("Content-Type", 'application/json');
        res.send({ feed: final });
    });
}