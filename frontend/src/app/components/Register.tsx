/// <reference types="vite/client" />

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api'; 
const actionCodeSettings = { //다음 페이지로 이동하기 위한 설정. Firebase Authentication에서 magic link를 사용할 때 필요
  url: 'http://localhost:5173/story-1', 
  handleCodeInApp: true,
  
};

console.log('Register is working'); //콘솔 확인용

interface FormData {
  nickname: string;
  email: string;
}

interface FieldError {
  nickname?: string;
  email?: string;
  submit?: string;
}

function validateForm(data: FormData): FieldError {
  const errors: FieldError = {};

  if (!data.nickname.trim()) errors.nickname = 'NICKNAME REQUIRED';
  else if (data.nickname.length < 2) errors.nickname = 'MIN 2 CHARACTERS';
  else if (data.nickname.length > 16) errors.nickname = 'MAX 16 CHARACTERS';
  else if (!/^[a-zA-Z0-9가-힣]+$/.test(data.nickname))
    errors.nickname = 'NO SPECIAL CHARACTERS';

  if (!data.email.trim()) errors.email = 'EMAIL REQUIRED';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'INVALID EMAIL FORMAT';

  return errors;
}

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({ nickname: '', email: '' });
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (touched[field]) {
      const errs = validateForm(newForm);
      setErrors((prev) => ({ ...prev, [field]: errs[field], submit: undefined }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, ...validateForm(form) }));
  };



const handleSubmit = async () => {
    const allTouched = { nickname: true, email: true };
    setTouched(allTouched);
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // 닉네임 중복 체크
      const nicknameRes = await fetch(`${API_URL}/auth/check-nickname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: form.nickname.trim() }),
      });
      const nicknameData = await nicknameRes.json();
      if (!nicknameRes.ok) {
        setErrors({ nickname: nicknameData.message ?? 'NICKNAME ALREADY TAKEN' });
        setIsSubmitting(false);
        return;
      }

      // 백엔드의 registerUser 호출해서 진짜 sessionId 받아오기
      // 여기서 UID는 임시로 이메일 앞부분을 쓰거나 랜덤값 제출
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: `user_${Date.now()}`, // 임시 UID 생성
          nickname: form.nickname.trim(),
          email: form.email.trim(),
        }),
      });

      const registerData = await registerRes.json();

      if (registerRes.ok) {
        // 서버가 준 진짜 sessionId 받기
        localStorage.setItem('sessionId', registerData.data.sessionId);
        
        // 유저 정보도 함께 저장
        localStorage.setItem('player', JSON.stringify(registerData.data));

        console.log("세션 발급 성공! ID:", registerData.data.sessionId);

        // 이메일 발송 화면 대신 바로 성공 처리
        setSubmitted(true); 
      } else {
        throw new Error(registerData.message || "REGISTRATION FAILED");
      }

    } catch (err: any) {
      console.error("가입 에러 상세:", err);
      setErrors({ submit: 'TRANSMISSION FAILED — TRY AGAIN' });
      setIsSubmitting(false);
    }
  };

  const fields: {
    key: keyof FormData;
    label: string;
    placeholder: string;
    icon: typeof User;
    hint: string;
    type: string;
  }[] = [
    {
      key: 'nickname',
      label: 'Agent Nickname',
      placeholder: 'Enter your AGENT NICKNAME',
      icon: User,
      hint: 'How ARIA will identify you. 2–16 characters, no special chars.',
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email Address',
      placeholder: 'your@email.com',
      icon: Mail,
      hint: 'A secure access link will be transmitted to this address.',
      type: 'email',
    },
  ];

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">
        <div className="mb-4">
          <div className="flex items-center gap-0 mb-6">
            <div className="text-[#00ffff] text-sm font-mono">AGENT REGISTRATION</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2
            className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}
          >
            Identify Yourself
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">
            Infiltration Protocol — Agent Verification Required
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">

            {submitted && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div
                  className="bg-[#001219] border-2 border-[#00ff00] p-12 max-w-md"
                  style={{ boxShadow: '0 0 50px rgba(0,255,0,0.4)' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-20 h-20 rounded-full border-2 border-[#00ff00] mx-auto mb-6 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(0,255,0,0.1)',
                      boxShadow: '0 0 30px rgba(0,255,0,0.5)',
                    }}
                  >
                    <Mail className="w-8 h-8 text-[#00ff00]" />
                  </motion.div>
                  <p className="text-[#00ff00] font-mono text-sm mb-4">
                    /// TRANSMISSION SENT ///
                  </p>
                  <p className="text-[#5de2e7] font-mono text-sm opacity-70">
                    Access link dispatched to<br />
                    <span className="text-[#00ffff] opacity-100">{form.email}</span>
                    <br /><br />
                    Check your inbox and click the link<br />
                    to begin your mission, {form.nickname}.
                  </p>
                  <button onClick={() => navigate('/story-1')} //페이지 넘기는 버튼이 있을 경우, 다음 경로로 설정.
                  className="mt-6 px-6 py-2 border border-[#00ff00] text-[#00ff00] font-mono hover:bg-[#00ff00] hover:text-black transition-all">
                  PROCEED TO LEVEL 1
                  </button>
                </div>
              </motion.div>
            )}

            {!submitted && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-xl"
              >
                <div
                  className="bg-[#001219] border-2 border-[#00ffff] p-10"
                  style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}
                >
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-3 border border-[#ff006e] p-3 mb-8"
                    style={{ backgroundColor: 'rgba(255,0,110,0.07)' }}
                  >
                    <AlertTriangle className="w-4 h-4 text-[#ff006e] flex-shrink-0" />
                    <p className="text-[#ff006e] font-mono text-xs">
                      ALL AGENTS MUST BE REGISTERED
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 border border-[#ff006e] p-3 mb-6"
                        style={{ backgroundColor: 'rgba(255,0,110,0.1)' }}
                      >
                        <AlertTriangle className="w-4 h-4 text-[#ff006e] flex-shrink-0" />
                        <p className="text-[#ff006e] font-mono text-xs">✗ {errors.submit}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-6">
                    {fields.map(({ key, label, placeholder, icon: Icon, hint, type }) => {
                      const hasError = touched[key] && errors[key];
                      const isValid = touched[key] && !errors[key] && form[key].trim();

                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              className="w-4 h-4"
                              style={{
                                color: hasError ? '#ff006e' : isValid ? '#00ff00' : '#ff00ff',
                              }}
                            />
                            <label
                              className="font-mono text-xs tracking-widest"
                              style={{
                                color: hasError ? '#ff006e' : isValid ? '#00ff00' : '#ff00ff',
                              }}
                            >
                              {label}
                            </label>
                            {isValid && (
                              <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[#00ff00] font-mono text-xs ml-auto"
                              >
                                ✓ OK
                              </motion.span>
                            )}
                          </div>

                          <input
                            type={type}
                            value={form[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            onBlur={() => handleBlur(key)}
                            placeholder={placeholder}
                            autoComplete={key === 'email' ? 'email' : 'off'}
                            className="w-full bg-[#000d14] border-2 px-4 py-3 font-mono text-sm outline-none transition-all duration-200"
                            style={{
                              borderColor: hasError ? '#ff006e' : isValid ? '#00ff00' : '#1a1f35',
                              color: '#00ffff',
                              caretColor: '#00ffff',
                              boxShadow: hasError
                                ? '0 0 10px rgba(255,0,110,0.3)'
                                : isValid
                                ? '0 0 10px rgba(0,255,0,0.2)'
                                : 'none',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = hasError ? '#ff006e' : '#00ffff';
                              e.target.style.boxShadow = '0 0 15px rgba(0,255,255,0.25)';
                            }}
                            onBlurCapture={(e) => {
                              e.target.style.borderColor = hasError
                                ? '#ff006e'
                                : isValid
                                ? '#00ff00'
                                : '#1a1f35';
                              e.target.style.boxShadow = hasError
                                ? '0 0 10px rgba(255,0,110,0.3)'
                                : isValid
                                ? '0 0 10px rgba(0,255,0,0.2)'
                                : 'none';
                            }}
                          />

                          <AnimatePresence mode="wait">
                            {hasError ? (
                              <motion.p
                                key="error"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-1 font-mono text-xs"
                                style={{ color: '#ff006e' }}
                              >
                                ✗ {errors[key]}
                              </motion.p>
                            ) : (
                              <motion.p
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 font-mono text-xs"
                                style={{ color: '#1a3040' }}
                              >
                                {hint}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="mt-10 w-full py-4 border-2 font-mono text-lg tracking-widest flex items-center justify-center gap-3 transition-colors"
                    style={{
                      borderColor: isSubmitting ? '#1a1f35' : '#00ffff',
                      color: isSubmitting ? '#1a1f35' : '#00ffff',
                      backgroundColor: isSubmitting ? 'transparent' : 'rgba(0,255,255,0.05)',
                      boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(0,255,255,0.2)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                    whileHover={
                      !isSubmitting
                        ? {
                            backgroundColor: 'rgba(0,255,255,0.15)',
                            boxShadow: '0 0 30px rgba(0,255,255,0.4)',
                          }
                        : {}
                    }
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-[#00ffff] border-t-transparent rounded-full"
                        />
                        TRANSMITTING...
                      </>
                    ) : (
                      <>
                        BEGIN INFILTRATION
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.p
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-center text-[#9d00ff] font-mono text-xs mt-4"
                >
                  [YOUR DATA WILL BE USED TO TRACK YOUR INFILTRATION PROGRESS]
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameContainer>
  );
}