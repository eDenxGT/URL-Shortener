import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import toast from 'react-hot-toast';
import QRCode from "react-qr-code";
import confetti from 'canvas-confetti';

// Separate UrlCard component
const UrlCard = ({ url }) => {
    const handleUrlClick = (e) => {
        e.preventDefault();
        window.open(url.longUrl, '_blank');
    };

    return (
        <Card className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="font-medium">
                        Short URL: {' '}
                        <a 
                            href={url.fullShortUrl} 
                            onClick={handleUrlClick}
                            className="text-primary hover:underline cursor-pointer"
                        >
                            {url.fullShortUrl}
                        </a>
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                        Original: {url.longUrl}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                        Clicks: {url.clicks.length}
                    </p>
                    {url.qrCode && (
                        <a 
                            href={url.qrCode} 
                            download="qr-code.png"
                            className="block"
                        >
                            <img 
                                src={url.qrCode} 
                                alt="QR Code" 
                                className="w-8 h-8 cursor-pointer" 
                                title="Click to download QR code"
                            />
                        </a>
                    )}
                </div>
            </div>
        </Card>
    );
};

// QR Code Popup component
const QRCodePopup = ({ isOpen, onClose, url }) => {
    useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>QR Code for your shortened URL</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <QRCode value={url} size={256} />
                    <p className="mt-4 text-sm text-gray-600">Scan this QR code to access your shortened URL</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [longUrl, setLongUrl] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCodePopup, setQrCodePopup] = useState({ isOpen: false, url: '' });
    const { token } = useAuth();
    
    useEffect(() => {
        fetchUrls();
    }, [token]);

    const fetchUrls = async () => {
        try {
            const response = await axios.get('http://localhost:5000/urls', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const urlData = response.data;
            if (Array.isArray(urlData)) {
                setUrls(urlData);
            } else {
                console.error('Unexpected API response format:', urlData);
                setUrls([]);
                toast.error("Invalid data format received from server");
            }
        } catch (error) {
            console.error('Error fetching URLs:', error);
            setUrls([]);
            toast.error("Failed to fetch URLs");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const cleanedUrl = longUrl.trim();
        if (!cleanedUrl) {
            toast.error("Please enter a URL");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/urls', 
                { 
                    longUrl: cleanedUrl,
                    customUrl: customUrl.trim() || undefined
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const newUrl = response.data;
            setUrls(prevUrls => Array.isArray(prevUrls) ? [newUrl, ...prevUrls] : [newUrl]);
            setLongUrl('');
            setCustomUrl('');
            toast.success("URL shortened successfully");
            setQrCodePopup({ isOpen: true, url: newUrl.fullShortUrl });
        } catch (error) {
            console.error('Error shortening URL:', error);
            const errorMessage = error.response?.data?.message || "Failed to shorten URL";
            toast.error(errorMessage);
        }
        setLoading(false);
    };

    if (loading && urls.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Shorten a URL</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            placeholder="Enter long URL (e.g., https://github.com/mohammedrimshan)"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Custom URL (optional, e.g., portfolio)"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Your URL will be: trimmrr.in/{customUrl || 'generated-code'}
                        </p>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Shortening...' : 'Shorten URL'}
                    </Button>
                </form>
            </Card>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Your URLs</h3>
                {Array.isArray(urls) && urls.length > 0 ? (
                    urls.map((url) => (
                        <UrlCard key={url._id} url={url} />
                    ))
                ) : (
                    <p className="text-gray-500">No URLs found</p>
                )}
            </div>

            <QRCodePopup
                isOpen={qrCodePopup.isOpen}
                onClose={() => setQrCodePopup({ isOpen: false, url: '' })}
                url={qrCodePopup.url}
            />
        </div>
    );
}

