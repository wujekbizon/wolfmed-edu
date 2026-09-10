export function encodeMimeBase64(value: string | Buffer): string {
  return Buffer.from(value).toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? ''
}
