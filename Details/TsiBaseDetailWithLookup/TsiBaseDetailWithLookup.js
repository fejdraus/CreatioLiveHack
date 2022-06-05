/**
 * @example
 * init: function() {
 *  this.callParent(arguments);
 *  // указываем колонку по которой открывать справочник
 *  this.setChildColumnName("TsiOrderStatus");
 * }
 */
define("TsiBaseDetailWithLookup", ["ConfigurationEnums"], function(configurationEnums) {
	return {
		attributes: {},
		methods: {
			/**
			* @inheritdoc BaseGridDetailV2#init
			*/
			init: function() {
				this.callParent(arguments);
				this.set("MasterColumnName", this.values.DetailColumnName);
			},

			/**
			 * Установка значения колонки-значения
			 * @param {string} name название колонки
			 */
			setChildColumnName: function(name) {
				this.set("ChildColumnName", name);
				this.set("ChildColumnEntitySchemaName", this.getEntitySchemaNameByColumnName(name));
			},

			/**
			 * Получить название справочника на которое ссылается колонка
			 * @param {string} name название колонки
			 */
			getEntitySchemaNameByColumnName: function(name) {
				var entityStructure = Terrasoft.data.models[this.entitySchemaName];
				var childColumn = entityStructure.columns[name];
				return childColumn && childColumn.referenceSchemaName;
			},

			/**
			 * Получить фильтры для справочника
			 * @param {string} columnName название колонки
			 */
			getChildColumnFilters: function(columnName) {
				return this.getNotExistsFilters(columnName);
			},

			/**
			 * Добавить фильтр для возможности добавления только уникальных значений
			 * @param {string} columnName название колонки
			 */
			getNotExistsFilters: function(columnName) {
				var filterGroup = Terrasoft.createFilterGroup();
				var filterNotExist = Terrasoft.createNotExistsFilter(`[${this.entitySchemaName}:${columnName}].Id`);
				filterNotExist.subFilters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, this.get("MasterColumnName"), this.get("MasterRecordId")));
				filterGroup.add("NotExistValuesFilter", filterNotExist);
				return filterGroup;
			},

			/**
			 * Открывает справочник дочерней колонки
			 */
			openChildColumnLookup: function() {
				if (Ext.isEmpty(this.get("MasterRecordId"))) {
					return;
				}
				var config = this.getChildLookupConfig();
				this.openLookup(config, this.onChildColumnValuesSelected, this);
			},

			/**
			 * Полусить конфиг открытия справочника
			 */
			getChildLookupConfig: function() {
				return {
					entitySchemaName: this.get("ChildColumnEntitySchemaName"),
					filters: this.getChildColumnFilters(this.get("ChildColumnName")),
					multiSelect: true
				};
			},

			/**
			 * @inheritdoc BaseGridDetailV2#onCardSaved
			 */
			onCardSaved: function() {
				this.openChildColumnLookup();
			},

			/*
			 * Открывает справочник в случае если карточка была ранее сохранена
			 * @inheritdoc BaseGridDetailV2#addRecord
			 * */
			addRecord: function() {
				var masterCardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNewRecord = masterCardState.state === configurationEnums.CardStateV2.ADD ||
					masterCardState.state === configurationEnums.CardStateV2.COPY;
				if (isNewRecord === true) {
					var args = {
						isSilent: true,
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					return;
				}
				this.openChildColumnLookup();
			},

			/**
			 * Обработка выбора значений из справочника
			 * @param {Object} args результат выборки из справочника
			 */
			onChildColumnValuesSelected: function(args) {
				var batch = Ext.create("Terrasoft.BatchQuery");
				var selectedItems = args.selectedRows.getItems();
				selectedItems.forEach(function(item) {
					item.column = item.column || this.get("ChildColumnName");
					var insert = this.getInsertQueryForItem(item);
					batch.addNamedQuery(insert, item.value);
				}, this);
				this.showBodyMask();
				batch.execute(this.onLookupValuesInserted, this);
			},

			/**
			 * Обработка ответа добавления записей
			 * @param {Object} response ответ сервера
			 */
			onLookupValuesInserted: function(response) {
				this.reloadGridData();
				this.hideBodyMask();
				if (!response.success) {
					Terrasoft.showErrorMessage(response.errorInfo.message);
				}
			},

			/**
			 * Получить insert для выбраного значения справочника
			 * @param {Object} item значение справочника
			 */
			getInsertQueryForItem: function(item) {
				var insert = Ext.create("Terrasoft.InsertQuery", {rootSchemaName: this.entitySchemaName});
				insert.setParameterValue(item.column, item.value, Terrasoft.DataValueType.GUID);
				this.addDefaultValuesToInsert(insert);
				return insert;
			},

			/**
			 * Добавить зачения по умолчанию к запросу Insert
			 * @param {Object} insert InsertQuery
			 */
			addDefaultValuesToInsert: function(insert) {
				var defaultValues = this.get("DefaultValues");
				defaultValues.forEach(function(defValue) {
					var columnType = this.columns[defValue.name].dataValueType;
					insert.setParameterValue(defValue.name, defValue.value, columnType);
				}, this);
			},
			/**
			 * @inheritdoc BaseGridDetailV2#getCopyRecordMenuItem
			 */
			getCopyRecordMenuItem: Terrasoft.emptyFn,

			/**
			 * @inheritdoc BaseGridDetailV2#getCopyRecordMenuItem
			 */
			getAddRecordButtonVisible: function() {
				return !this.get("IsDetailCollapsed");
			},

			/**
			 * @inheritdoc BaseGridDetailV2#getCopyRecordMenuItem
			 */
			getEditRecordMenuItem: Terrasoft.emptyFn
		}
	};
});

