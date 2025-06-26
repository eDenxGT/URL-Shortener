const URL = require('../models/UrlModel');
const { generateShortUrl, generateQRCode } = require('../utils/urlUtils');
const { isURL } = require('validator');

// Utility function to ensure URL has a protocol
const ensureProtocol = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
};

// Improved redirect function
const redirect = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        console.log('Attempting to redirect:', shortUrl);
        
        // Find the URL in database
        const urlDoc = await URL.findOne({ shortUrl });
        
        // Handle URL not found
        if (!urlDoc) {
            console.log('URL not found:', shortUrl);
            return res.status(404).render('404', { 
                message: 'Sorry, this short URL does not exist.' 
            });
        }

        // Ensure the long URL is properly formatted
        let redirectUrl = ensureProtocol(urlDoc.longUrl);

        // Validate the URL
        if (!isURL(redirectUrl)) {
            console.error('Invalid URL format:', redirectUrl);
            return res.status(400).send('Invalid URL format');
        }

        // Track the click with enhanced error handling
        try {
            urlDoc.clicks.push({
                timestamp: new Date(),
                referrer: req.headers.referer || 'Direct',
                userAgent: req.headers['user-agent'],
                ip: req.ip,
                country: req.headers['cf-ipcountry'] || 'Unknown'
            });
            await urlDoc.save();
        } catch (trackingError) {
            // Log tracking error but continue with redirect
            console.error('Click tracking error:', trackingError);
        }

        // Perform the redirect
        console.log('Redirecting to:', redirectUrl);
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.error('Redirect error:', error);
        return res.status(500).send('An error occurred while processing your request');
    }
};

// Improved URL creation with validation
const createUrl = async (req, res) => {
    try {
        const { longUrl, customUrl } = req.body;
        const userId = req.user._id;
        
        // Validate the long URL
        const fullLongUrl = ensureProtocol(longUrl);
        if (!isURL(fullLongUrl)) {
            return res.status(400).json({ 
                message: 'Invalid URL format. Please provide a valid URL.' 
            });
        }

        const baseUrl = process.env.DOMAIN_URL || 'https://trimmrr.in';
        const shortUrl = customUrl || generateShortUrl();
        const fullShortUrl = `${baseUrl}/${shortUrl}`;
        
        // Create URL document
        const url = new URL({
            longUrl: fullLongUrl,
            shortUrl,
            customUrl,
            fullShortUrl,
            qrCode: await generateQRCode(fullShortUrl),
            userId
        });

        await url.save();
        res.status(201).json(url);

    } catch (error) {
        console.error('URL creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create short URL',
            error: error.message 
        });
    }
};


const getUrls = async (req, res) => {
    try {
        const urls = await URL.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getAnalytics = async (req, res) => {
    try {
        const { urlId } = req.params;
        
        const url = await URL.findOne({ _id: urlId, userId: req.user._id });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        const analytics = {
            totalClicks: url.clicks.length,
            clicksByDate: {},
            browsers: {},
            countries: {},
            referrers: {}
        };

        url.clicks.forEach(click => {
            // Track clicks by date
            const date = click.timestamp.toISOString().split('T')[0];
            analytics.clicksByDate[date] = (analytics.clicksByDate[date] || 0) + 1;

            // Track browsers
            const browser = click.userAgent;
            analytics.browsers[browser] = (analytics.browsers[browser] || 0) + 1;

            // Track countries
            if (click.country) {
                analytics.countries[click.country] = (analytics.countries[click.country] || 0) + 1;
            }

            // Track referrers
            const referrer = click.referrer || 'Direct';
            analytics.referrers[referrer] = (analytics.referrers[referrer] || 0) + 1;
        });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createUrl,
    getUrls,
    redirect,
    getAnalytics
};