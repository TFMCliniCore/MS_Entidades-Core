import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        // ID de usuario de tu captura de pantalla
        user: "e7624e320b0c92", 
        // Tu contraseña de 14 caracteres recién confirmada
        pass: "582506984ea7a9" 
      }
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"Soporte Técnico" <soporte@clinicavet.test>',
        to: to,
        subject: subject,
        html: html,
      });
      console.log("¡Éxito! Correo enviado y recibido en el Sandbox de Mailtrap.");
    } catch (error: any) {
      console.error("Error SMTP:", error.message);
      throw error;
    }
  }
}