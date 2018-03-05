function getUsers() {
	let self = this;
	self.getUsersData = ko.observableArray();
	self.getUnknownData = ko.observableArray();
	let pending = false;
	self.users = function () {
		if(!pending) {
			pending = true;
			$.get('/getUsers',(data) => {
				self.getUsersData(data);
				pending = false;
			})
		}

	}
	self.users()
	setInterval(res => {
		self.users()
	},10000)

}

ko.applyBindings(new getUsers())