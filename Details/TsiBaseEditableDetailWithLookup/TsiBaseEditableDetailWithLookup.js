/**
 * Редактируемая деталь с реестром с выбором из справочника
 */
define("TsiBaseEditableDetailWithLookup", ["ConfigurationGrid",
	"ConfigurationGridGenerator", "ConfigurationGridUtilities"], function() {
	return {
		mixins: {
			ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
		},
		attributes: {
			"IsEditable": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"value": true,
				"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
			}
		},
		methods: {
			/**
			 * @override
			 * @inheritdoc Terrasoft.GridUtilities#createViewModel
			 */
			createViewModel(config) {
				this.callParent(arguments);
				this.changeViewModel(config.viewModel);
				
			},
			/**
			 * @override
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#createNewRow
			 */
			createNewRow(id, typeColumnValue, callback) {
				var parent = this.mixins.ConfigurationGridUtilities.createNewRow;
				parent.call(this, id, typeColumnValue, function(row) {
					this.changeViewModel(row);
					Ext.callback(callback, this, [row]);
				});
			},
			/**
			 * @inheritdoc TsiBaseDetailWithLookup#setChildColumnName
			 */
			setChildColumnName: function(name) {
				this.callParent(arguments);
				this.columns[name].enabled = false;
			},
			/**
			 * @inheritdoc ConfigurationGridUtilities.Grid#applyBusinessRulesForActiveRow
			 */
			applyBusinessRulesForActiveRow: function(id, gridLayoutItems) {
				var parent = this.mixins.ConfigurationGridUtilities.applyBusinessRulesForActiveRow;
				parent.apply(this, arguments);
				this.disableGridLayoutItems(gridLayoutItems);
			},
			/**
			 * Заблокировать поля
			 * @param {Array} gridLayoutItems перечень елементов на gridLayout
			 */
			disableGridLayoutItems: function(gridLayoutItems) {
				var disabledColumns = this.getDisabledColumns() || [];
				disabledColumns.forEach(function(columnName) {
					var gridLayoutItem = gridLayoutItems.find(function(item) {
						return item.name === columnName;
					}) || {};
					var controlConfig = gridLayoutItem.controlConfig || {};
					controlConfig.enabled = false;
					gridLayoutItem.controlConfig = controlConfig;
				});
			},
			/**
			 * Получить перечень колонок которые необходимо заблокировать
			 */
			getDisabledColumns: function() {
				return [this.get("MasterColumnName")];
			},
			/** Внести изменения во viewModel записи
			 * @param {Object} viewModel viewModel записи
			 */
			changeViewModel(viewModel) {
				if (viewModel.changeEventIntitied) {
					return;
				}
				this.appendEditableChildColumnFilter(viewModel);
			},
			appendEditableChildColumnFilter(viewModel) {
				let column = viewModel.columns[this.$ChildColumnName];
				if (Ext.isEmpty(column)) {
					return;
				}
				column.lookupListConfig = column.lookupListConfig || {};
				let scope = this;
				column.lookupListConfig.filter = function() {
					return scope.getChildColumnFilters(scope.$ChildColumnName);
				};
			}
		},
		rules: {},
		details: /**SCHEMA_DETAILS*/ {} /**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/ [
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"className": "Terrasoft.ConfigurationGrid",
					"generator": "ConfigurationGridGenerator.generatePartial",
					"generateControlsConfig": {"bindTo": "generatActiveRowControlsConfig"},
					"changeRow": {"bindTo": "changeRow"},
					"unSelectRow": {"bindTo": "unSelectRow"},
					"onGridClick": {"bindTo": "onGridClick"},
					"activeRowActions": [
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "save",
							"markerValue": "save",
							"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
						},
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "cancel",
							"markerValue": "cancel",
							"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
						},
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "remove",
							"markerValue": "remove",
							"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
						}
					],
					"listedZebra": true,
					"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
					"activeRowAction": {"bindTo": "onActiveRowAction"},
					"multiSelect": false
				}
			}
		] /**SCHEMA_DIFF*/
	};
});