// tslint:disable max-classes-per-file
import * as functions from "firebase-functions";
import { injectable } from "inversify";
import ow from "ow";
import * as smsapi from "smsapi";

import { Log } from "../Log";

import { SMSApiAdapter } from "./SMSApiAdapter";

@injectable()
export class SMSApiAdapterImpl implements SMSApiAdapter {
    private log = Log.tag("SMSApiAdapterImpl");
    private smsApi: smsapi;
    private test: boolean;

    public constructor(props: { test?: boolean }) {
        this.test = props.test || false;
        ow(this.test, "SMSApiAdapterImpl.props.test", ow.boolean);

        this.smsApi = this.constructApi();
    }

    public async sendMessage(props: { phoneNumber: string; message: string; fromName: string }): Promise<string> {
        this.log.info("Begin SMSApi send", props);

        let result: smsapi.BatchSendResult;
        try {
            result = await this.buildQuery(props).execute();
            this.log.info("SMSApi response", result);
        } catch (error) {
            this.log.info("SMSApi error", error);

            throw SMSApiAdapter.SMSApiError.make("Could not send sms: " + JSON.stringify(error));
        }
        return this.processResult(result);
    }

    private buildQuery(props: { phoneNumber: string; message: string; fromName: string }): smsapi.MessageBuilder {
        const builder = this.smsApi.message
            .sms()
            .normalize()
            .from(props.fromName)
            .to(props.phoneNumber)
            .message(props.message);

        if (this.test) return builder.test();
        else return builder;
    }

    private processResult(result: smsapi.BatchSendResult): string {
        if ("error" in result) {
            throw SMSApiAdapter.SMSApiError.make("Could not send sms: " + result.message);
        } else return `Sent ${result.count} messages`;
    }

    private constructApi() {
        const smsapiToken = this.obtainToken();
        ow(smsapiToken, "SMSApiAdapter smsapiToken", ow.string);

        return new smsapi({
            oauth: {
                accessToken: smsapiToken,
            },
        });
    }

    private obtainToken(): string {
        if (this.test) return "-test-token-";
        return functions.config().smsapi.oauthtoken;
    }
}
