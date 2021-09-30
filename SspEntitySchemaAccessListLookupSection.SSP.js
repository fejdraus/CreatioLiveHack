define("SspEntitySchemaAccessListLookupSection", ["ConfigurationGridUtilities"],
	function() {
		return {
			entitySchemaName: "VwSysSSPEntitySchemaAccessList",
			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},
			attributes: {
				"IsAddMode": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				}
			},
			methods: {

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilites#getCellControlsConfig
				 * @overridden
				 */
				getCellControlsConfig: function() {
					let controlsConfig =
						this.mixins.ConfigurationGridUtilities.getCellControlsConfig.apply(this, arguments);
					if (!this.get("IsAddMode")) {
						this.Ext.apply(controlsConfig, {
							enabled: false
						});
					}
					return controlsConfig;
				},

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilities#createNewRow
				 * @overridden
				 */
				createNewRow: function() {
					this.set("IsAddMode", true);
					this.mixins.ConfigurationGridUtilities.createNewRow.apply(this, arguments);
					this.set("IsAddMode", false);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSection#isSeparateModeActionsButtonVisible
				 * @overridden
				 */
				isSeparateModeActionsButtonVisible: function () {
					return false;
				},

				/**
				 * @inheritDoc BaseDataView#loadFiltersModule
				 * @overridden
				 */
				loadFiltersModule: this.Terrasoft.emptyFn
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "activeRowActionCopy"
				},
				{
					"operation": "remove",
					"name": "activeRowActionCard"
				}
			]/**SCHEMA_DIFF*/
		};
	});
