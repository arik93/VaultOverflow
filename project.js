webix.attachEvent("onBeforeAjax",
	function (mode, url, data, request, headers, files, promise) {
		request.withCredentials = true;
	}
);

webix.ready(function () {
	const dataVaultOverflow = new webix.DataCollection({
		url: "http://localhost:1337/question",
	}); 

	let editor = {
		view: "ckeditor5", value: "", minHeight: 250,
	};

	//Custom search-bar============================================================================================
	webix.protoUI({
		name: "search2",
		$cssName: "search custom",
		$renderIcon: function () {
			let config = this.config;
			if (config.icons.length) {
				let height = config.aheight - 2 * config.inputPadding,
					padding = (height - 18) / 2 - 1,
					html = "", pos = 2;

				for (let i = 0; i < config.icons.length; i++) {
					html += "<span style='right:" + pos + "px;height:"
						+ (height - padding) + "px;padding-top:" + padding
						+ "px;' class='webix_input_icon " + config.icons[i] + "'></span>";

					pos += 24;
				}
				return html;
			}
			return "";
		},
		on_click: {
			"webix_input_icon": function (e, id, node) {
				let name = node.className.substr(node.className.indexOf("wxi-") + 4);
				return this.callEvent("on" + name + "IconClick", [e]);
			}
		},
	}, webix.ui.search);
	//=============================================================================================================

	//Окно с добавлением вопроса===================================================================================
	let addQuestionWin = webix.ui({
		view: "window",
		id: "addWindow",
		position: "center",
		move: true,
		modal: true,
		head: ("Добавление вопроса"),
		body: {
			rows: [
				{
					view: "toolbar", elements: [
						{},
						{ view: "icon", icon: "mdi mdi-fullscreen", tooltip: "enable fullscreen mode", click: questionWindowFullScreen, },
					]	
				},

				{
					view: "form",
					id: "addForm",
					borderless: true,
					width: 675,
					elements: [
						{ id: "titleAdd(init)", view: "text", label: ("Название"), name: "title", labelPosition: "left", labelWidth: 150, },
						{ id: "descriptionAdd(init)", view: "forminput", label: ("Описание"), name: "description", labelPosition: "left", labelWidth: 150, body: editor, },
						{ height: 20 },
						{
							cols: [
								{},
								{
									view: "button", value: ("Применить"), width: 120,
									click: async () => {
										let titleValues = $$("titleAdd(init)").getValue();
										let descriptionValues = $$("descriptionAdd(init)").getValue();

										await webix.ajax().post("http://localhost:1337/question", { title: titleValues, description: descriptionValues });

										$$("addWindow").hide();
										$$("vaultOverflowTable").clearAll();

										await $$("vaultOverflowTable").load("http://localhost:1337/question");

										$$("vaultOverflowTable").adjustRowHeight("title");
										$$("vaultOverflowTable").refresh();
										webix.message(("Готово!"));
									}
								},
								{},
								{
									view: "button", value: ("Отменить"), width: 120,
									click: function (a, b, c) {
										$$("addWindow").hide();
									}
								},
								{},
							]
						},
					],
				},
			],
		}
	});
	//=============================================================================================================

	//Окно с добавлением ответа====================================================================================
	let addAnswerWin = webix.ui({
		view: "window",
		id: "answerWindow",
		position: "center",
		move: true,
		modal: true,
		head: ("Добавление ответа"),
		body: {
			rows: [
				{
					view: "toolbar", elements: [
						{},
						{ view: "icon", icon: "mdi mdi-fullscreen", tooltip: "enable fullscreen mode", click: answerWindowFullScreen, },
					]
				},

				{
					view: "form",
					id: "answerForm",
					borderless: true,
					width: 675,
					elements: [
						{ id: "answerAdd(init)", view: "forminput", label: ("Ответ"), name: "answer", labelPosition: "left", labelWidth: 150, body: editor, },
						{ height: 20 },
						{
							cols: [
								{},
								{
									view: "button", value: ("Применить"), width: 120,
									click: async () => {
										let answerValues = $$("answerAdd(init)").getValue();
										let questionIdValues = $$("questionInfoTable").getLastId();

										await webix.ajax().post("http://localhost:1337/answer", { text: answerValues, question: questionIdValues });

										$$("answerWindow").hide();
										$$("answerTable").clearAll();

										await $$("answerTable").load("http://localhost:1337/answer?question=" + questionIdValues);

										$$("answerTable").adjustRowHeight("text");
										$$("answerTable").adjustRowHeight("col1");
										$$("answerTable").refresh();
										webix.message(("Готово!"));
									}
								},
								{},
								{
									view: "button", value: ("Отменить"), width: 120,
									click: function (a, b, c) {
										$$("answerWindow").hide();
									}
								},
								{},
							]
						},
					],
				},
			],
		}
	});
	//=============================================================================================================

	//Окно с изменением вопроса====================================================================================
	let changeQuestionWin = webix.ui({
		view: "window",
		id: "questionChangeWindow",
		position: "center",
		move: true,
		modal: true,
		head: "Изменение вопроса",
		body: {
			rows: [
				{
					view: "toolbar", elements: [
						{},
						{ view: "icon", icon: "mdi mdi-fullscreen", tooltip: "enable fullscreen mode", click: questionChangeWindowFullScreen, },
					]
				},

				{
					view: "form",
					id: "questionChangeForm",
					borderless: true,
					width: 675,
					elements: [
						{ id: "questionIdChange(init)", view: "text", name: "id", hidden: true },
						{ id: "questionTitleChange(init)", view: "text", label: ("Название"), name: "title", labelPosition: "left", labelWidth: 150, },
						{ id: "questionDescriptionChange(init)", view: "forminput", label: ("Описание"), name: "description", labelPosition: "left", labelWidth: 150, body: editor, },
						{ height: 20 },
						{
							cols: [
								{},
								{
									view: "button", value: ("Применить"), width: 120,
									click: async () => {
										let titleValues = $$("questionTitleChange(init)").getValue();
										let descriptionValues = $$("questionDescriptionChange(init)").getValue();
										let tableId = $$("questionIdChange(init)").getValue();

										await webix.ajax().put(`http://localhost:1337/question/${tableId}`, { title: titleValues, description: descriptionValues });

										$$("questionChangeWindow").hide();
										$$("vaultOverflowTable").clearAll();

										await $$("vaultOverflowTable").load("http://localhost:1337/question");

										$$("vaultOverflowTable").adjustRowHeight("title");
										$$("vaultOverflowTable").refresh();
										webix.message(("Готово!"));
									}
								},
								{},
								{
									view: "button", value: ("Отменить"), width: 120,
									click: function (a, b, c) {
										$$("questionChangeWindow").hide();
									}
								},
								{},
							]
						},
					],
				},
			],
		}
	});
	//=============================================================================================================

	//Окно с изменением ответа=====================================================================================
	let changeAnswerWin = webix.ui({
		view: "window",
		id: "answerChangeWindow",
		position: "center",
		move: true,
		modal: true,
		head: "Изменение ответа",
		body: {
			rows: [
				{
					view: "toolbar", elements: [
						{},
						{ view: "icon", icon: "mdi mdi-fullscreen", tooltip: "enable fullscreen mode", click: answerChangeWindowFullScreen, },
					]
				},

				{
					view: "form",
					id: "answerChangeForm",
					borderless: true,
					width: 675,
					elements: [
						{ id: "answerIdChange(init)", view: "text", name: "id", hidden: true },
						{ id: "answerDescriptionChange(init)", view: "forminput", label: ("Описание"), name: "answers", labelPosition: "left", labelWidth: 150, body: editor, },
						{ height: 20 },
						{
							cols: [
								{},
								{
									view: "button", value: ("Применить"), width: 120,
									click: async () => {
										let answerValues = $$("answerDescriptionChange(init)").getValue();
										let tableId = $$("answerIdChange(init)").getValue();
										let questionIdValues = $$("questionInfoTable").getLastId();

										await webix.ajax().put(`http://localhost:1337/answer/${tableId}`, { text: answerValues });

										$$("answerChangeWindow").hide();
										$$("answerTable").clearAll();

										await $$("answerTable").load("http://localhost:1337/answer?question=" + questionIdValues);

										$$("answerTable").adjustRowHeight("text");
										$$("answerTable").adjustRowHeight("col1");
										$$("answerTable").refresh();
										webix.message(("Готово!"));
									}
								},
								{},
								{
									view: "button", value: ("Отменить"), width: 120,
									click: function (a, b, c) {
										$$("answerChangeWindow").hide();
									}
								},
								{},
							]
						},
					],
				},
			],
		}
	});
	//=============================================================================================================

	//Description window===========================================================================================
	let questionInfoWin = webix.ui({
		view: "window",
		id: "questionInfoWindow",
		position: "center",
		height: 700,
		width: 700,
		move: true,
		modal: true,
		head: "Question Info",
		body: {
			rows: [
				{
					view: "toolbar", elements: [
						{},
						{ view: "icon", icon: "mdi mdi-fullscreen", tooltip: "enable fullscreen mode", click: infoWindowFullScreen, },
						{ view: "icon", icon: "wxi-close", click: closeQuestionInfo, },
					]
				},

				{
					view: "datatable",
					id: "questionInfoTable",
					css: "webix_contrast",
					fixedRowHeight: false,
					rowHeight: 50,
					ready: function () {
						this.adjustRowHeight("description");
						this.refresh();
					},
					columns: [
						{ id: "id", hidden: true, },
						{ id: "description", header: "Description", fillspace: true, },
					],
				},

				{
					view: "toolbar", elements: [
						{ view: "icon", id: "addAnswerBtn", icon: "wxi-plus-circle", click: addAnswer, hidden: true, },
						{ view: "icon", id: "editAnswerBtn", icon: "wxi-pencil", click: changeAnswer, hidden: true, },
						{ view: "icon", id: "removeAnswerBtn", icon: "wxi-trash", click: removeAnswer, hidden: true, },
						{ template: "Answers Section", type: "section", },
						{ view: "icon", icon: "wxi-angle-double-up", click: showAnswerTable, },
						{ view: "icon", icon: "wxi-angle-double-down", click: hideAnswerTable, },
					]	
				},	

				{
					view: "datatable",
					id: "answerTable",
					select: true,
					hidden: true,
					fixedRowHeight: false,
					rowHeight: 50,
					ready: function () {
						this.adjustRowHeight("col1");
						this.adjustRowHeight("text");
						this.refresh();
					},
					columns: [
						{ id: "id", hidden: true, },
						{ id: "text", header: "Answers", fillspace: true, },
						{ id: "col1", header: "Username", width: 150, template: "#user.username#", },
					],
				},
			],
		}
	});
	//=============================================================================================================

	//Registration Form============================================================================================
	let registrationWin = webix.ui({
		view: "window",
		id: "registrationWindow",
		position: "center",
		height: 315,
		width: 300,
		move: true,
		modal: true,
		head: "Registration",
		body: {
			view: "form",
			id: "registrationForm",
			scroll: false,
			width: 300,
			height: 315,
			elements: [
				{ view: "text", id: "regLogin(init)", label: 'Login', name: "login" },
				{ view: "text", id: "regPass1(init)", type: "password", label: 'Password', name: "pass1" },
				{ view: "text", id: "regPass2(init)", type: "password", label: 'Repeat password', name: "pass2" },				
				{
					cols: [
						{ 
							view: "button", value: "Submit", 
							click: async function() {
								$$("registrationForm").validate();

								let loginValues = $$("regLogin(init)").getValue();
								let passValues = $$("regPass2(init)").getValue();
								
								if (loginValues === "" || passValues === "") {
									webix.alert("You must create both Login and Password");
								} else {
									await webix.ajax().post("http://localhost:1337/user", { username: loginValues, password: passValues });

									$$("registrationWindow").hide();
									webix.alert("Successful registration");
								}								
							}
						},

						{
							view: "button", value: "Cancel",
							click: function() {
								$$("registrationWindow").hide();
							}
						},
					],
				},
			],
			rules: {
				"login": webix.rules.isNotEmpty,
				"pass1": webix.rules.isNotEmpty,
				"pass2": webix.rules.isNotEmpty,

				$obj: function (data) {
					if (data.pass1 !== data.pass2) {
						webix.message("Passwords are not the same");
						return false;
					}

					return true;
				}
			},
			elementsConfig: {
				labelPosition: "top"
			}
		}
	});
	//=============================================================================================================

	//Login Form===================================================================================================
	let loginWin = webix.ui({
		view: "window",
		id: "loginWindow",
		position: "center",
		height: 250,
		width: 300,
		move: true,
		modal: true,
		head: "Authentication",
		body: {
			view: "form",
			id: "loginForm",
			scroll: false,
			width: 300,
			height: 250,
			elements: [
				{ view: "text", id: "login(init)", label: 'Login', name: "login" },
				{ view: "text", id: "pass1(init)", type: "password", label: 'Password', name: "pass1" },
				{
					cols: [
						{
							view: "button", value: "Accept",
							click: async function () {
								$$("loginForm").validate();

								let loginValues = $$("login(init)").getValue();
								let passValues = $$("pass1(init)").getValue();

								try {
									await webix.ajax().post("http://localhost:1337/user/login", { username: loginValues, password: passValues });
									
									$$("loginWindow").hide();
									$$("loginBtn").hide();
									$$("regBtn").hide();
									$$("logoutBtn").show();

									$$("addQuestionBtn").show();
									$$("editQuestionBtn").show();
									$$("removeQuestionBtn").show();

									$$("addAnswerBtn").show();
									$$("editAnswerBtn").show();
									$$("removeAnswerBtn").show();
								} catch (error) {
									webix.alert("You've entered wrong Login or Password");
								}
							}
						},

						{
							view: "button", value: "Cancel",
							click: function () {
								$$("loginWindow").hide();
							}
						},
					],
				},
			],
			rules: {
				"login": webix.rules.isNotEmpty,
				"pass1": webix.rules.isNotEmpty,
			},
			elementsConfig: {
				labelPosition: "top"
			}
		},
	});
	//=============================================================================================================

	//User Profile Table===========================================================================================
	// let userTable = webix.ui({
	// 	view: "window",
	// 	id: "userInfoWindow",
	// 	position: "center",
	// 	height: 1000,
	// 	width: 1000,
	// 	modal: true,
	// 	head: "User's Profile",
	// 	body: {
	// 		rows: [
	// 			{
	// 				view: "toolbar", elements: [
	// 					{ view: "icon", id: "addQuestionBtn", icon: "wxi-plus-circle", click: addItem, hidden: true, },
	// 					{ view: "icon", id: "editQuestionBtn", icon: "wxi-pencil", click: changeItem, hidden: true, },
	// 					{ view: "icon", id: "removeQuestionBtn", icon: "wxi-trash", click: removeItem, hidden: true, },
	// 				],
	// 			},

	// 			{
	// 				view: "datatable",
	// 				id: "userInfoWindow",
	// 				css: "webix_contrast",
	// 				fixedRowHeight: false,
	// 				rowHeight: 50,
	// 				select: true,
	// 				pager: "pager",
	// 				columns: [
	// 					{ id: "title", header: ["Question", { content: "textFilter" }], sort: "string_strict", fillspace: true, width: 500, },
	// 					{ id: "col1", header: "Username", width: 150, template: "#user.username#", },
	// 					{ id: "id", hidden: true, },
	// 					{
	// 						template: "<input href='#' class='description_btn' type='button' value=show>",
	// 						css: "padding_less",
	// 						width: 100,
	// 					},
	// 				],
	// 				ready: function () {
	// 					this.adjustRowHeight();
	// 					this.adjustRowHeight();
	// 					this.refresh();
	// 				},
	// 			},

	// 			{
	// 				view: "pager",
	// 				id: "pager",
	// 				size: 12,
	// 				group: 4,
	// 				template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
	// 			},
	// 		],
	// 	}
	// });
	//=============================================================================================================

	// Основное окно с вопросами===================================================================================
	webix.ui({
		rows: [
			{ template: "<b>Vault77 OVERFLOW</b>", height: 40, },

			{
				view: "toolbar", elements: [
					{ view: "icon", id: "addQuestionBtn", icon: "wxi-plus-circle", click: addItem, hidden: true, },
					{ view: "icon", id: "editQuestionBtn", icon: "wxi-pencil", click: changeItem, hidden: true, },
					{ view: "icon", id: "removeQuestionBtn", icon: "wxi-trash", click: removeItem, hidden: true, },
					{ 
						view: "search2", id: "search", placeholder: "Search by Title...", width: 250, icons: ["wxi-search", "wxi-close"],
						on: {
							onSearchIconClick: async function () {
								let searchValue = this.getValue();

								await webix.ajax().get("http://localhost:1337/question/search?query=" + searchValue );

								$$("vaultOverflowTable").clearAll();
								$$("vaultOverflowTable").load("http://localhost:1337/question/search?query=" + searchValue);
								$$("vaultOverflowTable").adjustRowHeight("title");
							},
							onCloseIconClick: function () {
								$$("search").setValue("");
								$$("vaultOverflowTable").clearAll();
								$$("vaultOverflowTable").load("http://localhost:1337/question");
								$$("vaultOverflowTable").adjustRowHeight("title");
							},
						} 
					},
					{},
					{
						view: "button", id: "loginBtn", value: "Login", inputWidth: 100, width: 100, css: "bt_2", align: "right", hidden: false,
						click: function() {
							$$("loginWindow").show();
							$$("loginForm").show();
							$$("login(init)").setValue();
							$$("pass1(init)").setValue();
						}
					},
					{
						view: "button", id: "regBtn", value: "Registration", inputWidth: 100, width: 100, css: "bt_1", align: "right", hidden: false,
						click: function() {
							$$("registrationWindow").show();
							$$("registrationForm").show();
							$$("regLogin(init)").setValue();
							$$("regPass1(init)").setValue();
							$$("regPass2(init)").setValue();
						}
					},
					{
						view: "button", id: "logoutBtn", value: "Logout", inputWidth: 100, width: 100, css: "bt_3", align: "right", hidden: true,
						click: async function() {
							await webix.ajax().post("http://localhost:1337/user/logout"); 

							$$("loginBtn").show();
							$$("regBtn").show();
							$$("logoutBtn").hide();

							$$("addQuestionBtn").hide();
							$$("editQuestionBtn").hide();
							$$("removeQuestionBtn").hide();

							$$("addAnswerBtn").hide();
							$$("editAnswerBtn").hide();
							$$("removeAnswerBtn").hide();
						}
					},
				]
			},

			{
				url:"http://localhost:1337/question",
				view: "datatable",
				id: "vaultOverflowTable",				
				css: "webix_contrast",
				select: true, 
				rowHeight: 50,
				fixedRowHeight: false,
				pager: "pager",
				columns: [
					{ id: "title", header: "Question", fillspace: true, width: 500, },
					{ id: "col1", header: "Username", width: 150, template: "#user.username#", },
					{ id: "id", hidden: true, },
					{
						template: "<input href='#' class='description_btn' type='button' value=show>",
						css: "padding_less",
						width: 100,
					},
				],
				ready: function () {
					this.adjustRowHeight("title");
					this.adjustRowHeight("col1");
					this.refresh();
				},
			},

			{
				view: "pager",
				id: "pager",
				size: 12,
				group: 4,
				template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
			},
		]
	});
	//=============================================================================================================

	//Functions:===================================================================================================
	//Vanila js fetch function =====================================
	async function request(path = "", method = "GET", data = {}) {
		let options = { method };

		if (method === 'POST') options.body = data;

		let result = await fetch("http://localhost:1337/" + path, options);

		return await result.json();
	}
	//==============================================================
	function addItem() {
		$$("addWindow").show();
		$$("addForm").show();
		$$("addForm").elements["title"].setValue("");
		$$("addForm").elements["description"].setValue("");
	}


	function addAnswer() {
		$$("answerWindow").show();
		$$("answerForm").show();
		$$("answerForm").elements["answer"].setValue("");
	}


	function changeItem() {
		let selectedId = $$("vaultOverflowTable").getSelectedId();
		let item = $$("vaultOverflowTable").getItem(selectedId);

		if (selectedId) {
			$$("questionChangeWindow").show();
			$$("questionChangeForm").show();
			$$("questionChangeForm").elements["id"].setValue(item.id);
			$$("questionChangeForm").elements["title"].setValue(item.title);
			$$("questionChangeForm").elements["description"].setValue(item.description);
		} else {
			webix.alert("Выберите вопрос");
		}
	}


	function changeAnswer() {
		let selectedId = $$("answerTable").getSelectedId();
		let item = $$("answerTable").getItem(selectedId);

		if (item) {
			$$("answerChangeWindow").show();
			$$("answerChangeForm").show();
			$$("answerChangeForm").elements["id"].setValue(item.id);
			$$("answerChangeForm").elements["answers"].setValue(item.text);
		} else {
			webix.alert("Выберите ответ");
		}
	}


	async function removeItem() {
		let selectedId = $$("vaultOverflowTable").getSelectedId();
		//==============================================================
		// let res = await request("question/" + selectedId, "DELETE"); //VANILA JS CODE (optional)
		// console.log(res);
		//==============================================================
		await webix.ajax().del(`http://localhost:1337/question/${selectedId}`);

		if (selectedId) {
			$$("vaultOverflowTable").remove(selectedId);
		}
		
		$$("vaultOverflowTable").clearAll();

		await $$("vaultOverflowTable").load("http://localhost:1337/question");

		$$("vaultOverflowTable").adjustRowHeight("title");
		$$("vaultOverflowTable").refresh();		
	}


	async function removeAnswer() {
		let selectedId = $$("answerTable").getSelectedId();
		let questionIdValues = $$("questionInfoTable").getLastId();

		await webix.ajax().del(`http://localhost:1337/answer/${selectedId}`);
		
		$$("answerTable").clearAll();

		await $$("answerTable").load("http://localhost:1337/answer?question=" + questionIdValues);

		$$("answerTable").adjustRowHeight("text");
		$$("answerTable").adjustRowHeight("col1");
		$$("answerTable").refresh();
	}

		
	function closeQuestionInfo() {
		$$("questionInfoTable").clearAll();
		$$("questionInfoWindow").hide();
		$$("questionInfoTable").hide();
		$$("answerTable").hide();		
	}

	function showAnswerTable() {
		$$("answerTable").show();
	}


	function hideAnswerTable() {
		$$("answerTable").hide();
	}


	$$("vaultOverflowTable").on_click.description_btn = async function showDescription(e, id, trg) {
		await $$("questionInfoTable").load("http://localhost:1337/question/" + id);

		$$("answerTable").clearAll();

		await $$("answerTable").load("http://localhost:1337/answer?question=" + id);

		$$("questionInfoTable").adjustRowHeight("description");
		$$("answerTable").adjustRowHeight("col1");
		$$("questionInfoWindow").show();
		$$("questionInfoTable").show();
		return false;
	};
	

	//session check====================================================================================
	$$("vaultOverflowTable").attachEvent("onBeforeRender", async function() {
		try {
			await webix.ajax().get("http://localhost:1337/user/me");

			$$("loginBtn").hide();
			$$("regBtn").hide();

			$$("logoutBtn").show();
			$$("addQuestionBtn").show();
			$$("editQuestionBtn").show();
			$$("removeQuestionBtn").show();
		} catch (error) {
			$$("logoutBtn").hide();
			$$("addQuestionBtn").hide();
			$$("editQuestionBtn").hide();
			$$("removeQuestionBtn").hide();
		}
	});


	$$("questionInfoTable").attachEvent("onBeforeRender", async function() {
		try {
			await webix.ajax().get("http://localhost:1337/user/me");

			$$("addAnswerBtn").show();
			$$("editAnswerBtn").show();
			$$("removeAnswerBtn").show();
		} catch (error) {
			$$("addAnswerBtn").hide();
			$$("editAnswerBtn").hide();
			$$("removeAnswerBtn").hide();
		}
	});
	//=================================================================================================

	//FULL SCREEN MODE functions=======================================================================
	function infoWindowFullScreen() {
		if (questionInfoWin.config.fullscreen) {
			webix.fullscreen.exit();
			this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
		} else {
			webix.fullscreen.set(questionInfoWin);
			this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
		}
		this.refresh();
	}
	function answerWindowFullScreen() {
		if (addAnswerWin.config.fullscreen) {
			webix.fullscreen.exit();
			this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
		} else {
			webix.fullscreen.set(addAnswerWin);
			this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
		}
		this.refresh();
	}
	function questionChangeWindowFullScreen() {
		if (changeQuestionWin.config.fullscreen) {
			webix.fullscreen.exit();
			this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
		} else {
			webix.fullscreen.set(changeQuestionWin);
			this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
		}
		this.refresh();
	}
	function answerChangeWindowFullScreen() {
		if (changeAnswerWin.config.fullscreen) {
			webix.fullscreen.exit();
			this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
		} else {
			webix.fullscreen.set(changeAnswerWin);
			this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
		}
		this.refresh();
	}
	function questionWindowFullScreen() {
		if (addQuestionWin.config.fullscreen) {
			webix.fullscreen.exit();
			this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
		} else {
			webix.fullscreen.set(addQuestionWin);
			this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
		}
		this.refresh();
	}
	//=================================================================================================
	//=============================================================================================================
});	
