import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TO_ADDRESSES = 'info@bonvoyagers.co, suhani@bonvoyagers.co, roy@bonvoyagers.co, bonvoyagers10@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, message, packageTitle, price, regularPrice, packageId } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 })
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    const html = [
      'Hi Admin,<br><br>',
      `<b>${name}</b> wants to know more about:<br><br>`,
      `<b>${packageTitle}</b><br><br>`,
      `Package Price: ₹${regularPrice}<br>`,
      `Sale Price: ₹${price}<br>`,
      `Package ID: ${packageId}<br>`,
      '<hr><br>',
      'Contact Details<br><br>',
      `Name: ${name}<br>`,
      `Phone: ${phone}<br>`,
      `Email: ${email || 'Not provided'}<br><br>`,
      'Message:<br>',
      `${message || 'Not provided'}<br><br>`,
      'Submitted from Bon Voyagers website',
    ].join('')

    await transporter.sendMail({
      from: `"Bon Voyagers Enquiry" <${SMTP_FROM}>`,
      to: TO_ADDRESSES,
      subject: `New Package Enquiry: ${packageTitle}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send enquiry.' }, { status: 500 })
  }
}
