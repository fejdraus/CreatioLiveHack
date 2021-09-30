DECLARE @ConfigurationVersion nvarchar(250)
DECLARE @PrimaryCulture nvarchar(250)
DECLARE @Product nvarchar(250)

DECLARE @SysAdminUnit_AllUsers uniqueidentifier = 'A29A3BA5-4B0D-DE11-9A51-005056C00008'

BEGIN
SELECT  @ConfigurationVersion = TextValue
FROM SysSettingsValue ssv
INNER JOIN SysSettings ss on ss.Id = ssv.SysSettingsId
WHERE ss.Code = 'ConfigurationVersion' 
    AND SysAdminUnitId = @SysAdminUnit_AllUsers

SELECT @PrimaryCulture = c.Name
FROM SysSettingsValue ssv
INNER JOIN SysSettings ss on ss.Id = ssv.SysSettingsId
INNER JOIN SysCulture c on c.Id = ssv.GuidValue
WHERE ss.Code = 'PrimaryCulture'
    AND SysAdminUnitId = @SysAdminUnit_AllUsers

SELECT @Product =
CASE
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankOnboardingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankSalesSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'Lending%')
     THEN 'bpmonline bank sales & bank customer journey & lending & marketing' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankOnboardingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankSalesSoftkey%')
     THEN 'bpmonline bank sales & bank customer journey' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesEnterprise')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'ServiceEnterpriseSoftkey')
     THEN 'bpmonline sales enterprise & marketing & service enterprise' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesEnterprise')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'CustomerCenterSoftkey')
     THEN 'bpmonline sales enterprise & marketing & customer center' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesCommerce')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'CustomerCenterSoftkey')
     THEN 'bpmonline sales commerce & marketing & customer center' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesTeam')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'CustomerCenterSoftkey')
     THEN 'bpmonline sales team & marketing & customer center' 
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'MarketingSoftkey%')
        AND EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesTeam')
     THEN 'bpmonline sales team & marketing'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesTeam')
     THEN 'bpmonline sales team'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesCommerce')
     THEN 'bpmonline sales commerce'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name = 'SalesEnterprise')
     THEN 'bpmonline sales enterprise'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name Like 'MarketingSoftkey%')
     THEN 'bpmonline marketing'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name = 'CustomerCenterSoftkey')
     THEN 'bpmonline customer center'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name = 'ServiceEnterpriseSoftkey')
     THEN 'bpmonline service enterprise'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'Studio%')
     THEN 'bpmonline studio'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'Lending%')
     THEN 'bpmonline lending'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankSalesSoftkey%')
     THEN 'bpmonline bank sales'
     WHEN 
        EXISTS(SELECT Id FROM SysPackage WHERE Name LIKE 'BankOnboardingSoftkey%')
     THEN 'bpmonline bank customer journey'
     ELSE  '?' END

SELECT @Product, @ConfigurationVersion, @PrimaryCulture
END