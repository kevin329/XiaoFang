var mySplitView = window.mySplitView = {
        splitView: null,
        trailClicked: WinJS.UI.eventHandler(function (ev) {
            //get the trail-id            
            document.getElementById("app").classList.add("show-trail");
            document.getElementById("app").classList.remove("show-home");
            document.querySelector('.win-splitviewpanetoggle').setAttribute('aria-expanded', false);
            // splitView.closePane();
            // document.getElementById("splitview").classList.add("win-splitview-pane-closed");

        }),
        homeClicked: WinJS.UI.eventHandler(function (ev) {
            //add remove tags
            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-trail");
            document.querySelector('.win-splitviewpanetoggle').setAttribute('aria-expanded', false);
            // document.querySelector('win-splitviewpanetoggle').attr('aria-expanded') = 'false';
            // this.closePane();
            // document.getElementById("splitview").classList.add("win-splitview-pane-closed");

        }),
    };
WinJS.UI.processAll().done(function () {
    var splitView = document.querySelector(".splitView").winControl;
    new WinJS.UI._WinKeyboard(splitView.paneElement);
});