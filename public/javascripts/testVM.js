function GetName() {
    let self = this;
    self.name = ko.observable();
    self.res = ko.observable();
    self.sendName = () => {
        if (!self.name()) {
            let input = $("input").css({ border: "1px solid red" });
            // self.res('Меня не наебешь');
        } else {
            $.post('/regNew', { name: self.name }, self.res);
        }
    }
}
ko.applyBindings(new GetName())