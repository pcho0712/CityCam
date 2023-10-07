import React, { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, Container, Typography } from '@mui/material';
import CameraComponent from '../components/CameraComponent'; 


const HomePage: React.FC = () => {
    const [cameraPermission, setCameraPermission] = useState<string | null>(null); // null: 未確認, 'granted': 許可, 'denied': 拒否
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [autoSave, setAutoSave] = useState<boolean>(false); // ローカル保存のステート


    useEffect(() => {
        // ここでgetUserMediaを呼び出してカメラへのアクセスを試みます
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                setCameraPermission('granted'); // カメラへのアクセスが許可された
                stream.getTracks().forEach(track => track.stop()); // ストリームを終了
            })
            .catch(function(error) {
                setCameraPermission('denied'); // カメラへのアクセスが拒否された
                console.error("Camera access denied:", error);
            });
    }, []);

    const handleCapture = (dataUrl: string) => {
        setScreenshots((prev) => {
            const newScreenshots = [...prev, dataUrl];
            if (newScreenshots.length > 8) newScreenshots.shift();
            return newScreenshots;
        });

        if (autoSave) {
            downloadImage(dataUrl);
        }
    };

    const downloadImage = (dataUrl: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `screenshot-${Date.now()}.png`;
        link.click();
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    };

    useEffect(() => {
        const handleSpacePress = debounce((e: KeyboardEvent) => {
            if (e.code === 'Space') {
                handleCapture(''); // 
            }
        }, 1000);

        window.addEventListener('keydown', handleSpacePress);

        return () => {
            window.removeEventListener('keydown', handleSpacePress);
        };
    }, []);



    return (
        <Container>

            <Typography variant="h4" gutterBottom>
                CityCamera Project
            </Typography>
            {cameraPermission === 'denied' && <p>カメラへのアクセスが拒否されました。</p>}


            <CameraComponent onCapture={handleCapture} />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        color="primary"
                    />
                }
                label="街景色を自動的に保存"
            />

            <div>
                <Typography variant="h6" gutterBottom>
                    みんなの街景色：
                </Typography>
                {screenshots.map((dataUrl, index) => (
                    dataUrl ? (
                        <img key={index} src={dataUrl} alt={`スクリーンショット ${index + 1}`} style={{ width: '240px', margin: '10px' }} />
                    ) : null
                ))}
            </div>
        </Container>
    );
}

export default HomePage;
