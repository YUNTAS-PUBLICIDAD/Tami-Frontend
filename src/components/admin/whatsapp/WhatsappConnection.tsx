import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import { config } from 'config';
import { useWhatsapp } from 'src/hooks/admin/whatsapp/useWhatsapp';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface WhatsappConnectionProps {
    onConnectionChange?: (connected: boolean) => void;
}

export default function WhatsappConnection({ onConnectionChange }: WhatsappConnectionProps) {
    const { requestQR, resetSession, isRequesting } = useWhatsapp();

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketStatus, setSocketStatus] =
        useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [isWaitingQR, setIsWaitingQR] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        console.log('🔌 Conectando a socket:', config.socket.whatsapp);

        const socket = io(config.socket.whatsapp, {
            transports: ['websocket', 'polling'], // MUY IMPORTANTE
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🟢 Socket conectado:', socket.id);
            setSocketStatus('connected');
        });

        socket.on('qr-update', (data) => {
            console.log('📡 QR update recibido:', data);

            const connected = data.connectionStatus === 'connected';

            setIsWaitingQR(false);
            setIsConnected(connected);
            setQrCode(data.qrData?.image || null);

            onConnectionChange?.(connected);

            if (connected) {
                setQrCode(null);
            }

            // se pide qr solo para cuando se cierra sesión desde el teléfono
            const dataKeys = Object.keys(data);
            if (dataKeys.length === 4 && 
                data.connectionStatus === 'disconnected' && 
                data.qrData === null && 
                data.isConnected === false &&
                data.hasActiveQR === false
            ) {
                console.log('🔴 Sesión cerrada desde el teléfono, solicitando nuevo QR...');
                setTimeout(async () => {
                    setIsWaitingQR(true);
                    await requestQR();
                    setIsWaitingQR(false);
                }, 1000);
            }
        });

        socket.on('disconnect', (reason) => {
            console.warn('🟠 Socket desconectado:', reason);
            setSocketStatus('disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('🔴 Error de conexión socket:', error.message);
            setSocketStatus('disconnected');
        });

        return () => {
            console.log('🧹 Cerrando socket');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [onConnectionChange]);

    const handleResetSession = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas reiniciar la sesión de WhatsApp?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        setQrCode(null);
        setIsConnected(false);
        setIsWaitingQR(true);
        onConnectionChange?.(false);

        const resetResult = await resetSession();
        if (!resetResult.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resetResult.message || 'Error al reiniciar la sesión',
                confirmButtonColor: '#14b8a6',
            });
            setIsWaitingQR(false);
            return;
        }

        const qrResult = await requestQR();
        if (!qrResult.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: qrResult.message || 'Error al solicitar código QR',
                confirmButtonColor: '#14b8a6',
            });
            setIsWaitingQR(false);
        }
    };

    const isLoading = isRequesting || isWaitingQR;

    return (
        <div className="space-y-6">
            <div className="bg-teal-50 dark:bg-gray-700/50 border border-teal-100 dark:border-teal-900/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-teal-800 dark:text-teal-400 mb-4 flex items-center gap-2">
                    Estado de Conexión
                </h3>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-teal-50 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'} animate-pulse`} />
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                            {isConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
                        </span>
                    </div>

                    {isConnected && (
                        <button
                            type="button"
                            onClick={handleResetSession}
                            disabled={isLoading || socketStatus !== 'connected'}
                            className="flex items-center gap-2 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 transition-all duration-300 px-5 py-2 rounded-full text-sm font-bold disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                    <span>Reiniciando...</span>
                                </>
                            ) : (
                                'Reiniciar Sesión'
                            )}
                        </button>
                    )}
                </div>

                {/** Cuando se muestra el QR por socket*/}
                {!isConnected && qrCode && socketStatus !== 'disconnected' && (
                    <div className="mt-6 p-6 bg-white dark:bg-gray-800 border-2 border-dashed border-teal-200 dark:border-teal-900/50 rounded-2xl text-center shadow-inner">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">
                            Escanea este código QR con tu WhatsApp:
                        </p>
                        <div className="flex justify-center p-4 bg-white rounded-xl shadow-lg inline-block mx-auto border border-gray-100">
                            <img
                                src={qrCode}
                                alt="QR WhatsApp"
                                className="w-64 h-64"
                            />
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-800 dark:text-teal-400 font-medium">
                                1. Abre WhatsApp
                            </div>
                            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-800 dark:text-teal-400 font-medium">
                                2. Menú / Dispositivos
                            </div>
                            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-800 dark:text-teal-400 font-medium">
                                3. Vincular dispositivo
                            </div>
                        </div>
                    </div>
                )}

                {/** mientras carga el QR INICIAL */}
                {!isConnected && !qrCode && !isLoading && socketStatus === 'connected' && (
                    <div className="mt-6 p-8 flex flex-col items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                        <div className="p-3 bg-amber-100 dark:bg-amber-800/40 rounded-full">
                            <AiOutlineLoading3Quarters className="animate-spin text-amber-600 text-2xl" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-amber-800 dark:text-amber-400">
                                Generando código QR
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                Esto puede tardar unos segundos. Por favor espera...
                            </p>
                        </div>
                    </div>
                )}

                {/** Si no hay conexión al socket */}
                {socketStatus === 'disconnected' && (
                    <div className="mt-6 p-8 flex flex-col items-center gap-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        <div className="p-3 bg-red-100 dark:bg-red-800/40 rounded-full text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-red-800 dark:text-red-400">
                                Sin conexión al servidor
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                                Verifica que el servicio de WhatsApp esté activo o recarga la página.
                            </p>
                        </div>
                    </div>
                )}

                {/* Mensaje de conexión exitosa */}
                {isConnected && (
                    <div className="mt-6 p-8 flex flex-col items-center gap-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl">
                        <div className="p-3 bg-green-100 dark:bg-green-800/40 rounded-full text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-green-800 dark:text-green-400">
                                WhatsApp vinculado correctamente
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                Tu cuenta está lista para realizar envíos masivos.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
