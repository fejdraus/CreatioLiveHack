 define("OpportunityPageV2", [],
	function () {
		return {
			entitySchemaName: "Opportunity",
			messages: {
			},
			attributes: {
				"Stage": {
					dependencies: [{
						columns: ["Stage"],
						methodName: "onStageChanged"
					}]
				},
			},
			mixins: {
			},
			modules: /**SCHEMA_MODULES*/{
			}/**SCHEMA_MODULES*/,
			details: /**SCHEMA_DETAILS*/{
			}/**SCHEMA_DETAILS*/,
			methods: {
				onEntityInitialized: function() {
					this.callParent(arguments);
					this.getStageConfirmationMessages();
				},
				onStageChanged: function() {
					this.set("CheckConfirmationMessage", true);
				},
				save: function() {
					var confirmationMessage = this.get("AvtStageConfirmationMessages").find(x => x.id === this.get("Stage").value);
					if (confirmationMessage && this.get("CheckConfirmationMessage")) {
						var scopeArguments = arguments;
						this.showConfirmationDialog(confirmationMessage.message, function(result) {
							if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
								this.set("CheckConfirmationMessage", false);
								this.save(scopeArguments);
							}
						}, ["Yes", "No"]);
					} else {
						this.callParent(arguments);
					}
				},
				getStageConfirmationMessages: function() {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "OpportunityStage"
					});
					esq.addColumn("AvtConfirmationMessage");
					esq.getEntityCollection(function (result) {
						var avtStageConfirmationMessages = [];
						if (result.success) {
							avtStageConfirmationMessages = result.collection.getItems().filter(i => i.get("AvtConfirmationMessage")).map(i => {
								return {
									id: i.get("Id"),
									message: i.get("AvtConfirmationMessage")
								};
							});
						}
						this.set("AvtStageConfirmationMessages", avtStageConfirmationMessages);
					}, this);
				},
			},
			diff: /**SCHEMA_DIFF*/[
			]/**SCHEMA_DIFF*/,
			rules: {
			}
		};
	});
