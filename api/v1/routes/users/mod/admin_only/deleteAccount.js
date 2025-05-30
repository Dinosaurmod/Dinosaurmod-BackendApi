module.exports = (app, utils) => {
    app.post('/api/v1/users/deleteaccount', utils.cors(), async function (req, res) {
        const packet = req.body;

        const username = (String(packet.username)).toLowerCase();
        const token = packet.token;
        const target = (String(packet.target)).toLowerCase();
        const reason = packet.reason;

        if (!username || !token || !target || typeof reason !== "string" || reason.length > 512) {
            return utils.error(res, 400, "Missing username or token");
        }

        if (!await utils.UserManager.loginWithToken(username, token)) {
            return utils.error(res, 401, "Invalid credentials");
        }

        if (!await utils.UserManager.isAdmin(username)) {
            return utils.error(res, 401, "Unauthorized");
        }

        if (!await utils.UserManager.existsByUsername(target, true)) {
            return utils.error(res, 404, "TargetNotFound");
        }

        const success = await utils.UserManager.deleteAccount(target);

        // ---- LOGGING ----
        let fields = [
            {
                name: "Mod",
                value: username
            },
            {
                name: "Target",
                value: target
            },
            
        ]

        fields.push(
            {
                name: "Reason",
                value: `\`\`\`\n${reason}\n\`\`\``
            },
        )

        utils.logs.sendAdminLog(
            {
                action: `User's account has been deleted`,
                content: `${username} deleted ${target}'s account`,
                fields
            },
            {
                name: username,
                icon_url: String(`${utils.env.ApiURL}/api/v1/users/getpfp?username=${username}`),
                url: String("https://penguinmod.com/profile?user=" + username)
            },
            0xc40404
        );

        res.status(success ? 200 : 500);
        res.header('Content-type', "application/json");
        res.send({ success });
    });
}