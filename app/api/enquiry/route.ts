import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TO_ADDRESSES = 'info@bonvoyagers.co, suhani@bonvoyagers.co, roy@bonvoyagers.co, bonvoyagers10@gmail.com'
const PHONE_PATTERN = /^[\d\s+\-()]{7,}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const rateLimitStore = new Map<string, number[]>()

function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitStore.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent)
    return true
  }
  recent.push(now)
  rateLimitStore.set(ip, recent)
  return false
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)

  try {
    if (isRateLimited(clientIp)) {
      console.log(`Enquiry rate limit hit from ${clientIp}`)
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { name, phone, email, message, packageTitle, price, regularPrice, packageId, website } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 })
    }
    if (typeof phone !== 'string' || !PHONE_PATTERN.test(phone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
    }
    if (email && (typeof email !== 'string' || !EMAIL_PATTERN.test(email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (typeof website === 'string' && website.trim() !== '') {
      console.log(`Enquiry honeypot triggered from ${clientIp}`)
      return NextResponse.json({ success: true })
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

    const safeName = escapeHtml(name)
    const safePhone = escapeHtml(phone)
    const safeEmail = escapeHtml(email || 'Not provided')
    const safeMessage = escapeHtml(message || 'Not provided')
    const safePackageTitle = escapeHtml(packageTitle)

    const html = [
      'Hi Admin,<br><br>',
      `<b>${safeName}</b> wants to know more about:<br><br>`,
      `<b>${safePackageTitle}</b><br><br>`,
      `Package Price: ₹${regularPrice}<br>`,
      `Sale Price: ₹${price}<br>`,
      `Package ID: ${packageId}<br>`,
      '<hr><br>',
      'Contact Details<br><br>',
      `Name: ${safeName}<br>`,
      `Phone: ${safePhone}<br>`,
      `Email: ${safeEmail}<br><br>`,
      'Message:<br>',
      `${safeMessage}<br><br>`,
      'Submitted from Bon Voyagers website',
    ].join('')

    await transporter.sendMail({
      from: `"Bon Voyagers Enquiry" <${SMTP_FROM}>`,
      to: TO_ADDRESSES,
      subject: `New Package Enquiry: ${packageTitle}`,
      html,
    })

    console.log(`Enquiry sent successfully from ${clientIp} for package ${packageId}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`Enquiry send failed from ${clientIp}`, err)
    return NextResponse.json({ error: 'Failed to send enquiry.' }, { status: 500 })
  }
}
