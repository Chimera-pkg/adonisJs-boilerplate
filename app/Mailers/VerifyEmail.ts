import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'

export default class VerifyEmail extends BaseMailer {
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()
  constructor(
    subject: string,
    to: string,
    username: string,
    verificationUrl: string,
    resendVerificationUrl: string,
    password?: string
  ) {
    super()

    this.subject = subject
    this.to = to
    this.html = this.generateHtml(username, verificationUrl, resendVerificationUrl, password)
  }

  public subject: string
  public to: string
  public html: string

  public generateHtml(username: string, url: string, resendUrl: string, password?: string) {
    return View.renderSync('emails/verify_email', {
      data: { username, url, resendUrl, password },
    })
  }
  /**
   * The prepare method is invoked automatically when you run
   * "VerifyEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */

  public prepare(message: MessageContract) {
    message.subject(this.subject).from('support@sahabatkebaikan.org').to(this.to).html(this.html)
  }
}
