if (exists (select *
				from sys.objects
				where object_id = OBJECT_ID(N'tsp_CreateVwVisa')
					and type in (N'P', N'PC')))
begin
	drop procedure [dbo].[tsp_CreateVwVisa];
end;
go

create procedure [dbo].[tsp_CreateVwVisa]
as	
begin
	declare @vSqlQuery NVARCHAR(MAX)
	declare @vVisaQuery NVARCHAR(MAX)
	declare @vVisaSchemaCount INT = 0
	declare @vTsiName NVARCHAR(100)
	declare @vTsiOwnerEntityColumn NVARCHAR(100)
	declare @vTsiNameEntityColumn NVARCHAR(100)
	declare @vTsiStatusEntityColumn NVARCHAR(100)
	declare @vTsiSysModuleId uniqueidentifier
	declare @vTsiVisaName NVARCHAR(100)

	IF OBJECT_ID(N'TsiVwVisa', N'V') IS NOT NULL
	BEGIN
		DROP VIEW [dbo].[TsiVwVisa]
	END;

	set @vSqlQuery = 'CREATE VIEW [dbo].[TsiVwVisa] AS';
			
	DECLARE VisaSchema CURSOR local FOR
	SELECT 
		sesr.[ColumnName] AS TsiOwnerEntityColumn, 
		(SELECT s.name
			FROM sys.columns                           s
			INNER JOIN sys.types                   t ON s.system_type_id=t.user_type_id and t.is_user_defined=0
			INNER JOIN sys.objects                 o ON s.object_id=o.object_id
			INNER JOIN sys.schemas                sh on o.schema_id=sh.schema_id
			join SysSchema ss on ss.Name = o.name  and  cast(MetaData as varchar(max)) like '%MetaData.Schema.D4%'
			WHERE o.type_desc = 'USER_TABLE' and  
			o.name 		IN 
         	(
         		SELECT 
         			[Name] 
         		FROM 
         			[SysSchema] 
         		WHERE 
         			[Name] = smv.[TsiName]
         	)
			and exists( select null from fn_listextendedproperty('TS.EntitySchemaColumn.UID', 'schema', 'dbo', 'table', o.name, 'column', s.name) where substring(cast(value as varchar(38)),2,36)
			= SUBSTRING(cast(ss.MetaData as varchar(max)),CHARINDEX('MetaData.Schema.D4',cast(ss.MetaData as varchar(max)))+20,36))) AS TsiNameEntityColumn, 
		smv.[TsiStatusEntityColumn], 
		ss.[Name] as TsiVisaName, 
		sm.[Code] as TsiName, 
		sm.[Id] as TsiSysModuleId
	FROM 
		[SysModuleVisa] AS smv
	INNER JOIN 
		[SysSchema] ss 
		ON ss.[UId] = smv.[VisaSchemaUId]
	INNER JOIN 
		[SysModule] sm 
		ON sm.[SysModuleVisaId] = smv.[Id]
	LEFT JOIN [SysEntitySchemaReference] sesr 
		ON sesr.[Id] =
         (
         SELECT  TOP 1 
		 	[Id] 
         FROM 
		 	[SysEntitySchemaReference]
         WHERE 
		 	[ColumnUId] = smv.TsiInitiatorColumnUId AND SysSchemaId 
		IN 
         	(
         		SELECT 
         			[Id] 
         		FROM 
         			[SysSchema] 
         		WHERE 
         			[Name] = smv.[TsiName]
         	)
         )
	WHERE smv.[TsiIsActive] = 1 AND ss.[Name] <> 'TsiTender'

	OPEN VisaSchema
		FETCH NEXT FROM VisaSchema
		into @vTsiOwnerEntityColumn,@vTsiNameEntityColumn,@vTsiStatusEntityColumn,@vTsiVisaName,@vTsiName,@vTsiSysModuleId
		WHILE @@FETCH_STATUS = 0
			BEGIN

			IF @vVisaSchemaCount > 0 
				SET @vSqlQuery = @vSqlQuery + CHAR(10) + ' UNION ALL '; 
			ELSE 
				SET @vSqlQuery = @vSqlQuery + CHAR(10) + 'with CTE1 AS (
				select main.*, ss.Name as [TsiEntitySchemaName] from (';
			SET @vVisaQuery = 'SELECT
				[v].[Id] [Id],
				[v].[CreatedOn] [CreatedOn],
				[v].[CreatedById] [CreatedById],
				[v].[ModifiedOn] [ModifiedOn],
				[v].[ModifiedById] [ModifiedById],
				[v].[ProcessListeners] [ProcessListeners],
				[v].[Objective] [Objective],
				[v].[VisaOwnerId] [VisaOwnerId],
				[v].[IsAllowedToDelegate] [IsAllowedToDelegate],
				[v].[DelegatedFromId] [DelegatedFromId],
				[v].[StatusId] [StatusId],
				[v].[SetById] [SetById],
				[v].[SetDate] [SetDate],
				[v].[IsCanceled] [IsCanceled],
				[v].[Comment] [Comment],
				[v].[IsRequiredDigitalSignature] [IsRequiredDigitalSignature],
				[v].[TsiPosition] [TsiPosition],
				[v].[TsiApprovalFlowTypeId] [TsiApprovalFlowTypeId],
				[v].[TsiDurationInHours] [TsiDurationInHours],
				[v].[TsiTaskCreatedOn] [TsiTaskCreatedOn],
				[v].[TsiTakenToWorkOn] [TsiTakenToWorkOn],
				[v].[TsiPlanTaskCompletionOn] [TsiPlanTaskCompletionOn],
				[v].[TsiIsTaskExecutionControled] [TsiIsTaskExecutionControled],
				[v].[TsiCycle] [TsiCycle],
				[v].[TsiIsNotify] [TsiIsNotify],
				[v].[TsiIsNotifyByEmail] [TsiIsNotifyByEmail],
				[v].[TsiRejectHandlerId] [TsiRejectHandlerId],
				[v].[TsiEscalationHandlerId] [TsiEscalationHandlerId],
				[v].[TsiUseProcessReject] [TsiUseProcessReject],
				[v].[TsiGroupNumber] [TsiGroupNumber],
				[v].[TsiIsCurrentGroup] [TsiIsCurrentGroup],
				[v].[TsiReasonForCancellationId] [TsiReasonForCancellationId],
				[v].[TsiIsStartNewGroup] [TsiIsStartNewGroup],
				[v].[TsiIsReminded] [TsiIsReminded],
				[v].[TsiIsEscalated] [TsiIsEscalated],
				[v].[TsiVisaTypeId] [TsiVisaTypeId],
				[v].[TsiPerform] [TsiPerform],
				[v].[TsiIsIndependent] [TsiIsIndependent],
				[v].[TsiTimeSpent] [TsiTimeSpent],
				CONVERT(uniqueidentifier, '''+CAST(@vTsiSysModuleId as nvarchar(38))+''') [TsiSysModuleId],
				[o].[Id] [TsiRecordId],
				[o].['+@vTsiOwnerEntityColumn+'Id] [TsiInitiatorId],
				[o].['+@vTsiNameEntityColumn+'] [TsiName],
				[o].['+@vTsiStatusEntityColumn+'Id] [TsiDocStateId]
			FROM
				['+@vTsiVisaName+'] [v] WITH(NOLOCK)
			INNER JOIN 
				['+@vTsiName+'] [o] WITH(NOLOCK) 
				ON ([v].['+REPLACE(@vTsiVisaName,'Visa','Id')+'] = [o].[Id])
			INNER JOIN 
				[VisaStatus] [vs] WITH(NOLOCK) 
				ON ([vs].[Id] = [v].[StatusId]
				AND [vs].[IsFinal] = 0)
			WHERE
				[TsiIsCurrentGroup] = 1'

			SET  @vSqlQuery = @vSqlQuery + @vVisaQuery;
			SET @vVisaSchemaCount = @vVisaSchemaCount + 1;

			FETCH NEXT FROM VisaSchema 
				INTO  @vTsiOwnerEntityColumn,@vTsiNameEntityColumn,@vTsiStatusEntityColumn,@vTsiVisaName,@vTsiName,@vTsiSysModuleId
		
			END 
	CLOSE VisaSchema;
	DEALLOCATE VisaSchema;
	SET @vSqlQuery = @vSqlQuery + CHAR(10) + ' UNION ALL '; 
	SET @vVisaQuery = 'SELECT
				[v].[Id] [Id],
				[v].[CreatedOn] [CreatedOn],
				[v].[CreatedById] [CreatedById],
				[v].[ModifiedOn] [ModifiedOn],
				[v].[ModifiedById] [ModifiedById],
				[v].[ProcessListeners] [ProcessListeners],
				[v].[Objective] [Objective],
				[sau].[Id] [VisaOwnerId],
				[v].[IsAllowedToDelegate] [IsAllowedToDelegate],
				[v].[DelegatedFromId] [DelegatedFromId],
				[v].[TsiStateId] [StatusId],
				[v].[SetById] [SetById],
				[v].[TsiSetDate] [SetDate],
				[v].[IsCanceled] [IsCanceled],
				[v].[Comment] [Comment],
				[v].[IsRequiredDigitalSignature] [IsRequiredDigitalSignature],
				[v].[TsiPosition] [TsiPosition],
				[v].[TsiApprovalFlowTypeId] [TsiApprovalFlowTypeId],
				[v].[TsiDurationInHours] [TsiDurationInHours],
				[v].[TsiTaskCreatedOn] [TsiTaskCreatedOn],
				[v].[ModifiedOn] [TsiTakenToWorkOn],
				[v].[TsiPlanTaskCompletionOn] [TsiPlanTaskCompletionOn],
				[v].[TsiIsTaskExecutionControled] [TsiIsTaskExecutionControled],
				[v].[TsiCycle] [TsiCycle],
				[v].[TsiIsNotify] [TsiIsNotify],
				[v].[TsiIsNotifyByEmail] [TsiIsNotifyByEmail],
				[v].[TsiRejectHandlerId] [TsiRejectHandlerId],
				[v].[TsiEscalationHandlerId] [TsiEscalationHandlerId],
				[v].[TsiUseProcessReject] [TsiUseProcessReject],
				[v].[TsiGroupNumber] [TsiGroupNumber],
				[v].[TsiIsCurrentGroup] [TsiIsCurrentGroup],
				[v].[TsiReasonForCancellationId] [TsiReasonForCancellationId],
				[v].[TsiIsStartNewGroup] [TsiIsStartNewGroup],
				[v].[TsiIsReminded] [TsiIsReminded],
				[v].[TsiIsEscalated] [TsiIsEscalated],
				[v].[TsiVisaTypeId] [TsiVisaTypeId],
				[v].[TsiPerform] [TsiPerform],
				[v].[TsiIsIndependent] [TsiIsIndependent],
				[v].[TsiTimeSpent] [TsiTimeSpent],
				CONVERT(uniqueidentifier, ''DD3E8C6E-C29F-478D-A65B-2F543F0BA39E'') [TsiSysModuleId],
				[o].[Id] [TsiRecordId],
				[v].[CreatedById] [TsiInitiatorId],
				[o].[UsrName] [TsiName],
				NULL [TsiDocStateId],
				N''UsrAreas'' [TsiEntitySchemaName]
			FROM
				[TsiTender] [v] WITH(NOLOCK)
			INNER JOIN 
				[UsrAreas] [o] WITH(NOLOCK) 
				ON ([v].[TsiAreaId] = [o].[Id])
			INNER JOIN 
				[TsiAreaTender] [tat] WITH(NOLOCK) 
				ON ([v].[TsiAreaTenderId] = [tat].[Id]
			AND 
				[tat].[TsiIsActive] = 1)
			INNER JOIN 
				[SysAdminUnit] [sau] WITH(NOLOCK) 
				ON ([v].[TsiOwnerId] = [sau].[ContactId])'
	
	SET  @vSqlQuery = @vSqlQuery + @vVisaQuery;

	IF @vVisaSchemaCount > 0 
		set @vSqlQuery = @vSqlQuery + ') as main
					INNER JOIN 
						[SysModule] [sm] WITH(NOLOCK) 
						ON main.[TsiSysModuleId] = [sm].[Id]
					INNER JOIN 
						[SysModuleEntity] [sme] WITH(NOLOCK) 
						ON [sm].[SysModuleEntityId] = [sme].[Id]
					INNER JOIN 
						[SysSchema] [ss] WITH(NOLOCK) 
						ON [sme].[SysEntitySchemaUId] = [ss].[UId]
						),
						CTE2 AS
						(
							SELECT 
								[q].* 
							FROM
								(
							SELECT 
								[Id],
								ROW_NUMBER() OVER (PARTITION BY VisaOwnerId, TsiRecordId  ORDER BY TsiPosition DESC) [TsiPositionOrder]
							FROM 
								[cte1] WITH(NOLOCK)) AS [q]
							WHERE 
								[q].[TsiPositionOrder] = 1
					)
					SELECT 
						[c1].* 
					FROM 
						[CTE1] [c1] WITH(NOLOCK)
					INNER JOIN 
						[CTE2] [c2] WITH(NOLOCK) ON ([c1].[Id] = [c2].[Id]);'; 
	ELSE 
		SET @vSqlQuery = @vSqlQuery + CHAR(10) + 'SELECT NULL AS Id,
			  NULL AS [CreatedOn],
			  NULL AS [CreatedById],
			  NULL AS [ModifiedOn],
			  NULL AS [ModifiedById],
			  NULL AS [ProcessListeners],
			  NULL AS [TsiInitiatorId],
			  NULL AS [TsiStatusId],
			  NULL AS [TsiTakenToWorkOn],
			  NULL AS [TsiSetDate],
			  NULL AS [TsiName],
			  NULL AS [TsiSysModuleId],
			  NULL AS [TsiVisaOwnerId],
			  NULL AS [TsiRecordId],
			  NULL AS [TsiPosition],
			  NULL AS [TsiDocStateId],
			  NULL AS [TsiTaskCreatedOn],
			  NULL AS [TsiDurationInHours],
			  NULL AS [TsiPlanTaskCompletionOn],
			  NULL AS [BnzUseProcessReject],
			  NULL AS [BnzRejectHandlerId],
			  NULL AS [BnzReasonForCancellationId],
			  NULL AS [BnzIsTaskExecutionControled],
			  NULL AS [BnzIsStartNewGroup],
			  NULL AS [BnzIsReminded],
			  NULL AS [BnzIsNotifyByEmail],
			  NULL AS [BnzIsNotify],
			  NULL AS [BnzIsEscalated],
			  NULL AS [BnzIsCurrentGroup],
			  NULL AS [BnzGroupNumber],
			  NULL AS [BnzEscalationHandlerId],
			  NULL AS [BnzCycle],
			  NULL AS [BnzApprovalFlowTypeId],
			  NULL AS [BnzSetById],
			  NULL AS [BnzObjective],
			  NULL AS [BnzIsRequiredDigitalSignature],
			  NULL AS [BnzIsCanceled],
			  NULL AS [BnzIsAllowedToDelegate],
			  NULL AS [BnzDelegatedFromId],
			  NULL AS [TsiExecDuration],
			  NULL AS [TsiExceedingDuration],
			  NULL AS [TsiEntitySchemaName];';
	
	EXECUTE sp_executesql @vSqlQuery;
end;

GO