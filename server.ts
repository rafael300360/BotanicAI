import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API para envío INVISIBLE de WhatsApp
  app.post("/api/feedback", async (req, res) => {
    const { content, userName } = req.body;
    const targetNumber = process.env.FEEDBACK_TARGET_NUMBER || "59892070093";

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    // Si no hay credenciales, simulamos éxito en desarrollo para no romper la UX
    if (!accountSid || !authToken || !fromNumber) {
      if (process.env.NODE_ENV !== "production") {
        console.log("MODO SIMULACIÓN: Feedback recibido:", content);
        return res.json({ success: true, simulated: true });
      }
      return res.status(500).json({ error: "Configuración de WhatsApp incompleta." });
    }

    const client = twilio(accountSid, authToken);

    const formatWhatsAppNumber = (num: string) => {
      const clean = num.replace(/whatsapp:/gi, '').replace(/\D/g, '');
      return `whatsapp:+${clean}`;
    };

    try {
      const message = await client.messages.create({
        body: `*BotanicAI Feedback*\n\nDe: ${userName || "Usuario"}\n\n${content}`,
        from: formatWhatsAppNumber(fromNumber),
        to: formatWhatsAppNumber(targetNumber)
      });
      res.json({ success: true, sid: message.sid });
    } catch (error: any) {
      console.error("Error en servidor WhatsApp:", error);
      res.status(500).json({ 
        error: error.message || "Error al enviar el mensaje",
        code: error.code 
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor BotanicAI activo en puerto ${PORT}`);
  });
}

startServer();
