import * as admin from "firebase-admin";
import { FirestoreRoles } from "firestore-roles";
import { Container } from "inversify";
import "reflect-metadata";

import { SMSApiAdapter } from "./adapters/SMSApiAdapter";
import { AddAdviceFunctionFactory } from "./functions/addadvice/AddAdviceFunctionFactory";
import { ImportAdviceToUserFunctionFactory } from "./functions/importadvicetouser/ImportAdviceToUserFunctionFactory";
import { SendSMSFunctionFactory } from "./functions/sendsms/SendSMSFunctionFactory";
import { AuthHelper } from "./helpers/AuthHelper";
import { AuthHelperImpl } from "./helpers/AuthHelperImpl";
import firebaseAppFactory from "./providers/FirebaseAppFactory";
import firestoreRolesFactory from "./providers/FirestoreRolesFactory";
import { RateLimiterFactory } from "./providers/RateLimiterFactory";
import { RateLimiterFactoryImpl } from "./providers/RateLimiterFactoryImpl";
import smsApiAdapterFactory from "./providers/SMSApiAdapterFactory";
import TYPES from "./TYPES";

function containerFactory() {
    const container = new Container();
    container
        .bind<admin.app.App>(TYPES.FirebaseAdminApp)
        .toDynamicValue(firebaseAppFactory)
        .inSingletonScope();
    container
        .bind<admin.firestore.Firestore>(TYPES.Firestore)
        .toDynamicValue(context => context.container.get<admin.app.App>(TYPES.FirebaseAdminApp).firestore())
        .inSingletonScope();
    container
        .bind<admin.database.Database>(TYPES.RealtimeDatabase)
        .toDynamicValue(context => context.container.get<admin.app.App>(TYPES.FirebaseAdminApp).database())
        .inSingletonScope();
    container
        .bind<FirestoreRoles>(TYPES.FirestoreRoles)
        .toDynamicValue(firestoreRolesFactory)
        .inSingletonScope();
    container
        .bind<SMSApiAdapter>(TYPES.SMSApiAdapter)
        .toDynamicValue(smsApiAdapterFactory)
        .inSingletonScope();
        .inSingletonScope();
    container.bind<AuthHelper>(TYPES.AuthHelper).to(AuthHelperImpl);
    container.bind<RateLimiterFactory>(TYPES.RateLimiterFactory).to(RateLimiterFactoryImpl);
    container.bind<AddAdviceFunctionFactory>(TYPES.AddAdviceFunctionFactory).to(AddAdviceFunctionFactory);
    container
        .bind<ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory)
        .to(ImportAdviceToUserFunctionFactory);
    container.bind<SendSMSFunctionFactory>(TYPES.SendSMSFunctionFactory).to(SendSMSFunctionFactory);

    return container;
}
export default containerFactory;
