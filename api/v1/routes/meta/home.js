module.exports = function(app, utils) {
    app.get("/", (req, res) => {
        res.redirect("https://dinosaurmod.github.io/Dino-Home");
    });
}