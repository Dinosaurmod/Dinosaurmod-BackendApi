module.exports = (app, utils) => {
    app.get('/api/v1/users/getemail', utils.cors(), async function (req, res) {
        const packet = req.query;

        const username = (String(packet.username)).toLowerCase();
        const token = packet.token;

        const target = (String(packet.target)).toLowerCase();

        if (!username || !token) {
            return utils.error(res, 400, "Missing username or token");
        }

        if (!await utils.UserManager.loginWithToken(username, token)) {
            return utils.error(res, 401, "Invalid credentials");
        }

        if (!await utils.UserManager.isAdmin(username)) {
            return utils.error(res, 401, "Unauthorized");
        }

        const email = await utils.UserManager.getEmail(target);

        if (!email) {
            return utils.error(res, 404, "UserNotFound");
        }

        res.status(200);
        res.header('Content-type', "application/json");
        res.send({ email });
    });
}