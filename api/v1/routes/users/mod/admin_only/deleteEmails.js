module.exports = (app, utils) => {
    app.post('/api/v1/users/deleteallemails', utils.cors(), async function (req, res) {
        const packet = req.body;

        const username = (String(packet.username)).toLowerCase();
        const token = packet.token;

        if (!username || !token) {
            return utils.error(res, 400, "Missing username or token");
        }

        if (!await utils.UserManager.loginWithToken(username, token)) {
            return utils.error(res, 401, "Invalid credentials");
        }

        if (!await utils.UserManager.isAdmin(username)) {
            return utils.error(res, 401, "Unauthorized");
        }

        await utils.UserManager.clearAllEmails();

        res.status(200);
        res.header('Content-type', "application/json");
        res.send({ success: true });
    });
}