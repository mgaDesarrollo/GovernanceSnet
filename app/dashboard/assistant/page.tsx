'use client';

import { useChat } from '@ai-sdk/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Send, Square, Trash, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessionWithRefresh } from '@/hooks/use-session';
import { Spinner } from '@/components/spinner';
import { useTheme } from '@/components/context/theme-context';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop, setMessages } = useChat();
  const { user } = useSessionWithRefresh();
  const { theme } = useTheme();

  const disabled = status === 'submitted' || status === 'streaming';

  const suggestions = useMemo(
    () => [
      'Show proposals that are in review.',
      'Show governance analytics for the last 90 days.',
      'How many active vs inactive workgroups exist?',
    ],
    []
  );

  const handleSuggestion = (text: string) => {
    if (disabled) return;
    sendMessage({ text });
    setInput('');
  };

  return (
    <div className="flex flex-col justify-between w-full max-w-3xl py-12 px-5 mx-auto stretch min-h-screen">
      <div>
        <div className="w-full max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="whitespace-pre-wrap flex w-full justify-start items-start gap-3 mb-5">
            <Image
              src={theme === 'dark' ? '/images/isotipo.svg' : '/images/isotipo-black.svg'}
              priority
              alt="SingularityNET Logo"
              title="SingularityNET Logo"
              width={225}
              height={255}
              className="rounded-full w-9 h-auto"
            />
            <p>Hello, I am your Governance Dashboard assistant. How may I assist you today?</p>
          </div>

          <div className="flex flex-col justify-start items-center gap-7 w-full">
            {messages.map(({ id, parts, role }) => (
              <div
                key={id}
                className={cn(
                  'whitespace-pre-wrap flex w-full justify-start items-start gap-3',
                  role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                {role === 'user' ? (
                  user && user?.image ? (
                    <Image
                      src={user?.image}
                      alt={user?.name}
                      title={user?.name}
                      width={225}
                      height={255}
                      className="rounded-full w-11 h-auto border-2 border-secondary"
                    />
                  ) : (
                    <User />
                  )
                ) : (
                  <Image
                    src={theme === 'dark' ? '/images/isotipo.svg' : '/images/isotipo-black.svg'}
                    priority
                    alt="SingularityNET Logo"
                    title="SingularityNET Logo"
                    width={225}
                    height={255}
                    className="rounded-full w-9 h-auto"
                  />
                )}

                <div>
                  {parts.map((part, i2) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p(props) {
                                return <p className="block" {...props} />;
                              },
                              a(props) {
                                return (
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold cursor-pointer text-blue-600 underline"
                                    {...props}
                                  />
                                );
                              },
                              ul(props) {
                                return <ul className="flex flex-col justify-center items-start gap-4" {...props} />;
                              },
                              ol(props) {
                                return <ol className="flex flex-col justify-center items-start gap-4" {...props} />;
                              },
                            }}
                            key={`${id}-${i2}`}
                          >
                            {part.text}
                          </Markdown>
                        );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>

          {status === 'submitted' ? (
            <div className="whitespace-pre-wrap flex w-full justify-start items-center gap-3 mb-5">
              <Image
                src={theme === 'dark' ? '/images/isotipo.svg' : '/images/isotipo-black.svg'}
                priority
                alt="SingularityNET Logo"
                title="SingularityNET Logo"
                width={225}
                height={255}
                className="rounded-md w-9 h-auto"
              />
              <div className="flex justify-start items-center gap-3">
                <Spinner />
                <p>Loading...</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        {messages.length === 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 opacity-80" />
              <p className="text-sm font-medium opacity-80">Try asking:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSuggestion(s)}
                  className={cn(
                    'cursor-pointer text-left text-sm rounded-xl border border-secondary/40 px-3 py-3',
                    'bg-background/50 hover:bg-background transition-colors',
                    'shadow-sm'
                  )}
                  aria-label={`Ask: ${s}`}
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (status === 'streaming' || status === 'submitted') {
              stop();
            } else {
              if (!input.trim()) return;
              sendMessage({ text: input });
              setInput('');
            }
          }}
          className="mt-6 flex gap-3 items-center w-full"
        >
          <input
            className="w-full max-w-3xl p-2 border rounded shadow-xl border-secondary outline-secondary focus:outline-secondary focus:border-secondary"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={disabled}
          />
          <button
            className="border border-secondary hover:opacity-80 transition-all cursor-pointer text-white font-semibold px-4 py-2 rounded shadow-lg flex items-center"
            type="submit"
          >
            {disabled ? <Square fill="currentColor" /> : <Send />}
          </button>
          <button
            disabled={disabled}
            className="border border-secondary hover:opacity-80 transition-all cursor-pointer text-white font-semibold px-4 py-2 rounded shadow-lg flex items-center"
            type="button"
            onClick={() => {
              setInput('');
              setMessages([]);
            }}
          >
            <Trash />
          </button>
        </form>
      </div>
    </div>
  );
}
