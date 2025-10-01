import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool, AccountRecovery, UserPoolClient, OAuthScope, UserPoolClientIdentityProvider, UserPoolDomain, StringAttribute, CfnIdentityPool, CfnIdentityPoolRoleAttachment, CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import { Role, FederatedPrincipal, ManagedPolicy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

export class CognitoPocStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // User Pool básico con autenticación por email/usuario y password policy razonable
    const userPool = new UserPool(this, 'PocUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
        requireSymbols: false,
        tempPasswordValidity: Duration.days(7)
      },
      standardAttributes: {
        email: { required: true, mutable: true }
      },
      customAttributes: {
        tenant: new StringAttribute({ mutable: true })
      }
    });

    // Dominio Cognito (usa prefijo aleatorio configurable). Cambia el prefix si lo deseas.
    const domain = new UserPoolDomain(this, 'pocuserdomain', {
      userPool,
      cognitoDomain: { domainPrefix: `poc-login-12345678` }
    });

    // URLs de redirect para local y un placeholder de cloudfront (puedes editar post-deploy)
    const callbackUrls = [
      'http://localhost:5174/',
      'http://localhost:5173/',
      'https://example-cloudfront-domain.net/'
    ];

    const logoutUrls = [
      'http://localhost:5174/',
      'http://localhost:5173/',
      'https://example-cloudfront-domain.net/'
    ];

    // App Client para Hosted UI (PKCE + Code Flow)
    const hostedClient = new UserPoolClient(this, 'HostedUIClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        callbackUrls,
        logoutUrls,
        flows: { authorizationCodeGrant: true },
        scopes: [
          OAuthScope.OPENID,
          OAuthScope.EMAIL,
          OAuthScope.PROFILE
        ]
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO
      ],
      preventUserExistenceErrors: true,
      generateSecret: false,
      enableTokenRevocation: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30)
    });

    // Segundo client para password auth directa (POC1 style)
    const directClient = new UserPoolClient(this, 'DirectPasswordClient', {
      userPool,
      authFlows: { userPassword: true, userSrp: true },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
      generateSecret: false,
      enableTokenRevocation: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30)
    });

    // Identity Pool (federación a credenciales IAM) enlazado al User Pool
    const identityPool = new CfnIdentityPool(this, 'PocIdentityPool', {
      allowClassicFlow: false,
      allowUnauthenticatedIdentities: true, // invitados opcionales
      cognitoIdentityProviders: [
        {
          clientId: hostedClient.userPoolClientId,
          providerName: userPool.userPoolProviderName
        }
      ]
    });

    // Principal federado para el identity pool
    const cognitoPrincipalCondition = {
      StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
      'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' }
    } as any;

    const authenticatedRole = new Role(this, 'IdentityPoolAuthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        cognitoPrincipalCondition,
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonCognitoReadOnly')
      ]
    });

    const unauthenticatedRole = new Role(this, 'IdentityPoolUnauthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' }
        },
        'sts:AssumeRoleWithWebIdentity'
      )
    });

    new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn
      }
    });

    // ========== GRUPOS DE COGNITO CON ROLES DIFERENCIADOS ==========
    
    // Rol para usuarios Admin - permisos amplios
    const adminRole = new Role(this, 'AdminRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        cognitoPrincipalCondition,
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role para usuarios administradores con permisos amplios'
    });
    
    // Permisos para admins (ejemplo: acceso a S3 y DynamoDB)
    adminRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:*',
        'dynamodb:*',
        'cognito-idp:*'
      ],
      resources: ['*']
    }));

    // Rol para usuarios regulares - permisos limitados
    const userRole = new Role(this, 'UserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        cognitoPrincipalCondition,
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role para usuarios regulares con permisos limitados'
    });
    
    // Permisos limitados para usuarios regulares
    userRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        'arn:aws:s3:::my-public-bucket/*',
        'arn:aws:s3:::my-public-bucket'
      ]
    }));

    // Crear grupo de Admins
    const adminGroup = new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admins',
      description: 'Grupo de administradores con permisos amplios',
      roleArn: adminRole.roleArn,
      precedence: 1 // Mayor prioridad
    });

    // Crear grupo de Users
    const userGroup = new CfnUserPoolGroup(this, 'UserGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Users',
      description: 'Grupo de usuarios regulares con permisos limitados',
      roleArn: userRole.roleArn,
      precedence: 2 // Menor prioridad
    });

    // ========== OUTPUTS ==========

    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'HostedDomain', { value: domain.baseUrl() });
    new CfnOutput(this, 'HostedClientId', { value: hostedClient.userPoolClientId });
    new CfnOutput(this, 'DirectClientId', { value: directClient.userPoolClientId });
    new CfnOutput(this, 'CallbackUrls', { value: callbackUrls.join(',') });
    new CfnOutput(this, 'LogoutUrls', { value: logoutUrls.join(',') });
    new CfnOutput(this, 'IdentityPoolId', { value: identityPool.ref });
    new CfnOutput(this, 'AuthenticatedRoleArn', { value: authenticatedRole.roleArn });
    new CfnOutput(this, 'UnauthenticatedRoleArn', { value: unauthenticatedRole.roleArn });
    new CfnOutput(this, 'AdminRoleArn', { value: adminRole.roleArn });
    new CfnOutput(this, 'UserRoleArn', { value: userRole.roleArn });
    new CfnOutput(this, 'AdminGroupName', { value: adminGroup.groupName || 'Admins' });
    new CfnOutput(this, 'UserGroupName', { value: userGroup.groupName || 'Users' });
  }
}
