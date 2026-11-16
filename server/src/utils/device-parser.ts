import { FastifyRequest } from 'fastify';
import { UAParser } from 'ua-parser-js';
import { ClientDeviceInfo } from '../types/index.js';

export const parseClientDeviceInfo = (request: FastifyRequest): ClientDeviceInfo => {
  const userAgentString = request.headers['user-agent'] || 'Unknown Device';
  const parser = new UAParser(userAgentString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown Browser';
  const osName = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown OS';

  let deviceName = `${browserName} on ${osName}`;
  if (device.model) {
    deviceName = `${device.vendor || ''} ${device.model} (${browserName})`.trim();
  }

  // Extract IP (respecting reverse proxies like Cloudflare or Nginx)
  const forwardedFor = request.headers['x-forwarded-for'];
  let ipAddress = request.ip || '127.0.0.1';
  if (forwardedFor) {
    ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
  }

  return {
    deviceName,
    ipAddress,
    userAgent: userAgentString,
    metadata: {
      browser: browser.name || 'Unknown',
      browserVersion: browser.version || '',
      os: os.name || 'Unknown',
      osVersion: os.version || '',
      deviceType: device.type || 'desktop',
      deviceModel: device.model || '',
      deviceVendor: device.vendor || '',
    },
  };
};
