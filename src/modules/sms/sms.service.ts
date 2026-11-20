import { Injectable, Logger,} from '@nestjs/common';

import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    constructor(
        private readonly configService: ConfigService,
    ) {}
    async sendOtp(mobile: string, otp: string): Promise<boolean> {
        try {
            const baseUrl = this.configService.get<string>('sms.baseUrl') || process.env.SMS_BASE_URL;
            const apiKey = this.configService.get<string>('sms.apiKey') || process.env.SMS_API_KEY;
            const senderId = this.configService.get<string>('sms.senderId') || process.env.SMS_SENDER_ID;
            const templateId = this.configService.get<string>('sms.templateId') || process.env.SMS_DLT_TEMPLATE_ID;

            if (!baseUrl || !apiKey || !senderId || !templateId) {
                this.logger.error(
                    `SMS configuration is incomplete. Details: baseUrl=${baseUrl}, apiKey=${apiKey ? '***' : undefined}, senderId=${senderId}, templateId=${templateId}`,
                );
                throw new Error('SMS configuration is incomplete');
            }

            const text =
                `Dear Entercraft User\n` +
                `Your OTP to reset password is ${otp}. Valid for 10 minutes. ` +
                `Do not share this OTP with anyone.\n` +
                `Thank You`;

            const url = baseUrl.endsWith('/')
                ? `${baseUrl}SendSMS`
                : `${baseUrl}/SendSMS`;

            const params = new URLSearchParams({
                apikey: apiKey,
                senderid: senderId,
                channel: this.configService.get<string>('sms.channel') || process.env.SMS_CHANNEL || 'Trans',
                DCS: this.configService.get<string>('sms.dcs') || process.env.SMS_DCS || '0',
                flashsms: this.configService.get<string>('sms.flashSms') || process.env.SMS_FLASH_SMS || '0',
                route: this.configService.get<string>('sms.route') || process.env.SMS_ROUTE || '2',
                dlttemplateid: templateId,
                number: String(mobile),
                text,
            });

            const response = await axios.get(
                `${url}?${params.toString()}`,
                { timeout: 15000 },
            );

            if (
                response.data?.ErrorCode &&
                response.data.ErrorCode !== '000'
            ) {
                this.logger.error(
                    `SMS rejected with code: ${response.data.ErrorCode}`,
                );

                return false;
            }

            return true;

        } catch (error) {

            if (axios.isAxiosError(error)) {

                this.logger.error(
                    `SMS request failed: ${
                        error.response?.status ?? 'No status'
                    } ${JSON.stringify(
                        error.response?.data ?? error.message,
                    )}`,
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

    // Generate secure 6-digit OTP
    generateOtp(): string {
        return randomInt(100000, 1000000).toString();
    }
}