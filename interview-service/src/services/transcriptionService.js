const fs = require("fs");
const path = require("path");
const os = require("os");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Whisper is known to hallucinate stock end-of-video phrases on silent or
 * low-volume audio (artifacts from its YouTube/podcast training set). If any of
 * these substrings appears in a sentence we drop that sentence and everything
 * after it, since once Whisper "switches" into hallucination mode the rest of
 * the output is also fabricated.
 */
const HALLUCINATION_TRIGGERS = [
	"subscribe",
	"my channel",
	"the channel",
	"thanks for watching",
	"thank you for watching",
	"like and subscribe",
	"don't forget to",
	"see you next time",
	"see you in the next",
	"next video",
	"bachelorette",
	"becca's season",
	"becca s season",
	"have a good night",
	"have a great day",
	"have a nice day",
	"bye-bye",
	"bye bye",
	"goodbye",
	"woof",
	"[music]",
	"(music)",
	"♪",
];

/**
 * If the entire transcription collapses to one of these stock fillers we treat
 * the whole chunk as a hallucination on silence and return nothing.
 */
const STANDALONE_FILLER =
	/^(thank you|thanks|peace|you|bye|okay|ok|hmm|uh|um|mm|hm|yeah)[.!?\s]*$/i;

const sanitizeTranscription = (raw) => {
	const text = (raw || "").trim();
	if (!text) return "";

	const sentences = text.match(/[^.!?\n]+[.!?]?/g) || [text];
	const kept = [];
	for (const sentence of sentences) {
		const lower = sentence.toLowerCase();
		if (HALLUCINATION_TRIGGERS.some((trigger) => lower.includes(trigger))) {
			break;
		}
		kept.push(sentence);
	}

	const cleaned = kept
		.join("")
		.replace(/\s{2,}/g, " ")
		.trim();
	if (!cleaned) return "";
	if (STANDALONE_FILLER.test(cleaned)) return "";
	return cleaned;
};

/**
 * Transcribe an audio buffer using Whisper.
 * Each buffer should be a complete, self-contained webm file (not a fragment).
 */
const transcribeAudio = async (audioBuffer) => {
	const tmpPath = path.join(
		os.tmpdir(),
		`whisper-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`,
	);

	try {
		fs.writeFileSync(tmpPath, audioBuffer);

		const response = await openai.audio.transcriptions.create({
			model: "whisper-1",
			file: fs.createReadStream(tmpPath),
			language: "en",
			response_format: "text",
			// Deterministic decoding sharply reduces hallucinated continuations
			// on silent or low-volume chunks.
			temperature: 0,
		});

		const raw =
			typeof response === "string" ? response : response.text || "";
		return sanitizeTranscription(raw);
	} finally {
		try {
			fs.unlinkSync(tmpPath);
		} catch {
			// cleanup failure is non-critical
		}
	}
};

module.exports = { transcribeAudio, sanitizeTranscription };
