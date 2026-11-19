import { Injectable, Logger,} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    constructor(private readonly configService : ConfigService){}

    async sendOtp(mobile : string , otp : string):Promise<boolean>{

        try {
            const baseUrl = this.configService.get<string>('sms.baseUrl');
            const apiKey = this.configService.get<string>('sms.apiKey');
            const senderId = this.configService.get<string>('sms.senderId');
            const templateId = this.configService.get<string>('sms.templateId');

            if(!baseUrl || !apiKey || !senderId || !templateId){
                throw new Error("SMS configuration is incomplete");
            };

            const text =`Dear Entercraft User\n` +`Your OTP to register is ${otp}. Valid for 10 minutes. ` +`Do not share this OTP with anyone.\n` +`Thank You`;

            const url = baseUrl.endsWith('/') ? `${baseUrl}SendSMS`: `${baseUrl}/SendSMS`;
            const params = new URLSearchParams({
                apikey: apiKey,
                senderid: senderId,
                channel: this.configService.get<string>('sms.channel') || '',
                DCS: this.configService.get<string>('sms.dcs') || '0',
                flashsms: this.configService.get<string>('sms.flashSms') || '0',
                route: this.configService.get<string>('sms.route') || '2',
                dlttemplateid: templateId,
                number: mobile,
                text,
            });

            const response = await axios.get(`${url}?${params.toString()}`,{ timeout: 15000,},);
            if(response.data?.ErrorCode && response.data.ErrorCode !== '000'){
                this.logger.error(`SMS rejected with code: ${response.data.ErrorCode}`,)
                return false;
            }
            return true;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger.error(
                    `SMS request failed: ${error.response?.status ?? 'No status'} ${JSON.stringify(error.response?.data ?? error.message)}`,
                );
            } else {
                this.logger.error(
                    error instanceof Error
                        ? error.message
                        : 'Unknown SMS error',
                );
            }

            return false;
        }
    }
}