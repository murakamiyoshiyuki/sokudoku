'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Users, Clock, BookOpen, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  results?: number[];
}

interface Timer {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  preset: number;
}

export default function SokudokuInstructorApp() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timer, setTimer] = useState<Timer>({ minutes: 10, seconds: 0, isRunning: false, preset: 600 });
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: '', results: [] },
    { id: 2, name: '', results: [] },
    { id: 3, name: '', results: [] },
    { id: 4, name: '', results: [] },
    { id: 5, name: '', results: [] },
    { id: 6, name: '', results: [] }
  ]);
  const [speedListeningVolume, setSpeedListeningVolume] = useState(0.3);
  const [timerBellVolume, setTimerBellVolume] = useState(0.5);
  const [isSpeedListeningPlaying, setIsSpeedListeningPlaying] = useState(false);
  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  
  const scriptSections = [
    'preparation', 'start', 'measurement', 'eyeTraining1', 'eyeTraining2', 'eyeTraining3', 
    'breathing1', 'breathing2', 'breathing3', 'viewing', 'stretch', 'fastViewing', 
    'finalMeasurement', 'impression', 'closing'
  ];
  
  const sectionTitles = [
    '準備', 'スタート', '1分計測', '眼筋①左右', '眼筋②上下', '眼筋③遠近・シェア',
    '呼吸法①説明', '呼吸法②実践', '呼吸法③回復', '眺める', 'ストレッチ', '速く見る',
    '最終計測', '感想', '終わりの挨拶'
  ];
  const [scriptSection, setScriptSection] = useState('preparation');

  const speedListeningRef = useRef<HTMLAudioElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 現在時刻更新
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // タイマー機能（カウントダウン）
  useEffect(() => {
    if (timer.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          const totalSeconds = prev.minutes * 60 + prev.seconds;
          if (totalSeconds <= 0) {
            playBellSound();
            return { ...prev, isRunning: false };
          }
          const newTotal = totalSeconds - 1;
          return {
            ...prev,
            minutes: Math.floor(newTotal / 60),
            seconds: newTotal % 60
          };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timer.isRunning]);

  // 速聴音声制御
  useEffect(() => {
    if (speedListeningRef.current) {
      speedListeningRef.current.volume = speedListeningVolume;
    }
  }, [speedListeningVolume]);

  const toggleSpeedListening = () => {
    if (speedListeningRef.current) {
      if (isSpeedListeningPlaying) {
        speedListeningRef.current.pause();
      } else {
        speedListeningRef.current.play();
      }
      setIsSpeedListeningPlaying(!isSpeedListeningPlaying);
    }
  };

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const stopTimer = () => {
    const minutes = Math.floor(timer.preset / 60);
    const seconds = timer.preset % 60;
    setTimer({ minutes, seconds, isRunning: false, preset: timer.preset });
  };

  const setTimerPreset = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    setTimer({ minutes, seconds: remainingSeconds, isRunning: false, preset: seconds });
  };

  const nextScript = () => {
    if (currentScriptIndex < scriptSections.length - 1) {
      const newIndex = currentScriptIndex + 1;
      setScriptSection(scriptSections[newIndex]);
      setCurrentScriptIndex(newIndex);
    }
  };

  const prevScript = () => {
    if (currentScriptIndex > 0) {
      const newIndex = currentScriptIndex - 1;
      setScriptSection(scriptSections[newIndex]);
      setCurrentScriptIndex(newIndex);
    }
  };

  const playBellSound = () => {
    const audio = new Audio('/audio/目覚まし時計のアラーム.mp3');
    audio.volume = timerBellVolume;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const formatScript = (text: string) => {
    return text
      // 【タイトル】を大きく太字に
      .replace(/【([^】]+)】/g, '<div class="text-xl font-bold text-blue-600 mb-3 mt-2">【$1】</div>')
      // ◆小見出しを太字に
      .replace(/◆([^\n]+)/g, '<div class="text-lg font-semibold text-green-600 mb-2 mt-3">◆$1</div>')
      // ●中見出しを太字に
      .replace(/●([^\n]+)/g, '<div class="text-md font-semibold text-purple-600 mb-2 mt-2">●$1</div>')
      // 【】内のキーワードを強調
      .replace(/【([^】]+)】/g, '<span class="font-bold text-orange-600">【$1】</span>')
      // ＜＞内のキーワードを強調
      .replace(/＜([^＞]+)＞/g, '<span class="font-bold text-red-500">＜$1＞</span>')
      // 改行を<br>に変換
      .replace(/\n/g, '<br>');
  };

  const generateAITopics = async () => {
    const topics = [
      '尊敬する人はどんな人ですか？',
      '最近楽しかったことは何ですか？',
      '学生時代に楽しかったことは？',
      'あなたにとって大事なことは何ですか？',
      '時間もなにも制限がないとしたら何をやりたいですか？',
      '今一番興味があることは何ですか？',
      'あなたの理想の1年後はどんな感じですか？',
      '今、感じていることを聞かせて下さい',
      '何をしているときが楽しいですか？',
      'あなたの趣味や好きなことは何ですか？',
      '子供の頃の夢は何でしたか？',
      '今までで一番嬉しかった出来事は？',
      'もし宝くじが当たったら何をしますか？',
      '人生で影響を受けた本や映画はありますか？',
      '今チャレンジしていることはありますか？',
      'あなたの人生のモットーは何ですか？',
      '好きな季節とその理由は？',
      'ストレス解消法は何ですか？',
      '理想の休日の過ごし方は？',
      '今一番欲しいものは何ですか？'
    ];
    
    const shuffledTopics = topics.sort(() => 0.5 - Math.random());
    setAiTopics(shuffledTopics.slice(0, 5));
  };

  const updateStudentName = (id: number, name: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, name } : student
      )
    );
  };

  const lessonScript = {
    preparation: `【準備】
部屋を整える 換気 室温湿度 清掃 場や物への感謝
速聴の音量・Wi-Fi環境・充電・画角・必要物品・室温の確認
受講生様の履歴確認（氏名・ニックネーム・受講回数・前回の文字数・見幅・感想・インストラクター所見・次回予約の有無）
自分を整える（呼吸法・ストレッチ・瞑想など）MVPの意識 意図セット`,

    start: `【スタート】
では、○月○日○時○分
レッスンを始めさせていただきます。
インストラクター養成のむらりんこと、村上良之です。
よろしくお願いします。
ではまず、自己紹介をお願いします
・お名前
・ニックネーム  
・今回の受講回数
・前回の最終文字数
・（今の気分・レッスンを始めたきっかけ等）をお願いします。`,

    measurement: `【1分計測】
では、早速１分間の計測からいきましょう。
自分の現在地を知っていきましょう！！
○○さんは 見幅は○○ですね。
（24回目までは見幅の指示はこちらから、24回超えたら見幅を確認してもOK)
レッスン本の16ページを開いて準備して頂いて
1分間で今の状態を知っていきましょう
では、よ～いスタート`,

    eyeTraining1: `【眼筋トレーニング】
次は眼筋トレーニングです。
目の筋肉のストレッチとトレーニングですね～

◆①左右に動かすトレーニング
目の高さに両指、肩幅よりもやや広めの位置に指をもっていって下さい
顔は正面を向いたまま

まず、右の指を見てどんどん指を遠ざけ それを目で追っていきます。
目の左側の筋肉が気持ちよく伸ばされている感じです
ムリはせずに気持ちいいところまでストレッチします。

では、瞬きをして反対
左手側の指を見ます。
指を遠ざけて目で追っていきまーす
目の右側の筋肉が気持ち良く伸ばされてるのを感じていきまーす
はい、瞬きをして反対、右側を見まーす
はい、瞬きして反対、左側を見まーす
手を下ろして目を閉じて下さい

深呼吸してゆったりリラックスして下さい
目の中に小川や滝が流れてるのをイメージをして、目に酸素と潤いを戻していきます。

◆左右の計測
では、目を開けて 左右の計測をします
6秒間計 一往復で一カウント
何回できるかカウントしてください。
ではにっこり笑顔で
よーい スタート
はーい ありがとうございまーす
回数を記入して下さい`,

    eyeTraining2: `【眼筋トレーニング】

◆②上下に動かすトレーニング
おでこの辺りとお腹の前に指をおいて下さい
顔は正面を向いたまま

まず、上の指を見ます。
どんどん指を天井の方に遠ざけ、目で追っていきます。
目の下側の筋肉が気持ちよく伸ばされている感じです

では、瞬きをして反対
下側の指を見ます。
指を床の方に遠ざけて
まぶたの上の筋肉が気持ち良く伸ばされてるのを感じていきまーす
もし見にくければ 指を少し前の方にだしてもらうと見やすいです

はい、瞬きして上でーす
はい、瞬きして下でーす

では、手を下ろして目を閉じて下さい。
深呼吸してゆったりリラックスして下さい。
まぶたの裏側に小川や滝が流れてるのをイメージをして、目に酸素と潤いを戻していきます。

◆上下の計測
では、目を開けて頂いて
上下の計測をします
6秒間計測 一往復で一カウント
何回できるかカウントしてください。
では、笑顔で
よーい スタート
はーい ありがとうございまーす
回数を記入して下さい`,

    eyeTraining3: `【眼筋トレーニング】

◆③遠近に動かすトレーニング
鼻先15から20cmに、人指し指を立てます
その遠く延長線上に目標物を決めて下さい
目の前の指に焦点を合わせます
周りの景色がぼやけている感じ

そして、瞬きして
遠くの目標物に焦点を合わせます
指がぼやけてる感じですね

では、手前の指 遠く 手前 遠く
では、手を下ろして目を閉じて
深呼吸してゆったりリラックスして下さい。
まぶたの裏側に小川や滝が流れてるのをイメージをして、目に酸素と潤いを戻していきます。

◆遠近の計測
では、目を開けて頂いて
遠近の計測をします
6秒間計測します 一往復で一カウント
何回できるかカウントしてください。
では、笑顔で
よーい スタート
はーい ありがとうございまーす
回数を記入して下さい

◆シェア
それでは
それぞれの回数のシェアをお願いします
まずは○○さんから
「・・・」
どんな感じでしたか？
「・・・」`,

    breathing1: `【呼吸法】検定は座位のみ
それでは体をリラックスさせるために呼吸法をします。

◆説明
腹式呼吸で大きくゆっくり深呼吸しながら
お腹の3箇所に手を当ててお腹の動きを感じていきます。

【呼吸のルール】
・呼吸は腹式呼吸
・鼻から3秒吸い
・お腹を風船のように膨らませて、
・3秒息をとめます。
・この時、体に力がはいらないようにします。
・口から10秒吐きお腹を凹ませます。

お腹が膨れたり、へこんだりする
のを、手で感じとってください。

◆姿勢作り
姿勢をただして、椅子に浅めに腰かけて
足は肩幅に開きます。
足の裏をピタッと床につけて
大地と繋がっているイメージを感じてください。
背筋を伸ばして
カウントに合わせて深呼吸してください。
苦しかったら自分で調整してもOKです

・軽く目を閉じて
・手をみぞおちにセット
・意識は呼吸にフォーカスします。
あー今すってるなあ、はいてるなあ。
という意識に向けてください。`,

    breathing2: `【呼吸法】実践

◆実践
では体の中の空気を全部吐き出しましょう

【みぞおち】
はいすってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10

【おへそ】
下にスライドしておへその上に手を置いて
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10

【丹田】
下にスライドしておへその下10センチぐらい丹田です
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10
すってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10`,

    breathing3: `【呼吸法】回復

◆回復
・目を閉じたまま、
・手は膝の上において
・自分のペースで深呼吸
・呼吸が整った方から
・ゆっくりと目を開けて戻ってきてくださ～い

はい、おかえりなさい。
しっかり、水分も摂って下さいねー
どうでしたか？`,

    viewing: `【眺める】
では10分間眺めるにいきましょう
眺めるでは
4つの並行処理をすることで感性を高め、周辺視野を広げます。
（『脳のチューニング』です。左脳と右脳のチューニングです。左脳だけだと、本を読んでいて眠くなる、疲れる、ほかの事を考えている、結局何が書いて あったか分からない、となります。文字を読まずに見ることをして、全脳を使うことにより、脳のバランスを整えていく事がこの10分間の目的になります。）

・目は文字を追いながら
・耳は速聴を聞き
・周辺視野も意識して
・同時に皆さんと会話をします。

リアル:時々私が手を振るので 4つのこと出来ているか確認して、うんうんと頷いて下さい
zoom:時々お声をかけるので 4つの・・・。

見幅は
一回目 一行の人は 上から下へ
二回目 二行の人は 二行を上から下へ
三回目 三行の人は 三行を上から下へ
四回目 1/3ページ 上から下
五回目 1/2ページ 上から下
六回目 1/2ページ 上から下
七回目 面をパッと見る
八回目 面をパッと見る
九回目 二面を一面として見る
十回目 持ち方をかえて 二面をパッと見る
十一回目 パラパラ

・内容は理解せずに、見るだけでいいです。
・速聴は聞こえてますか？
・周辺視野も意識してください。
・10分間よろしくお願いします。

では今日のテーマ
・時間もなにも制限がないとしたら何をやりたいですか
・学生時代に楽しかったこと
・尊敬する人はどんな人ですか
・あなたにとって大事なことは何ですか

テーマ集 参考にしてね😊

～スタート～

はい、ありがとうございます。`,





    stretch: `【ストレッチ】
はい 今からストレッチをします
筋肉を緩めることで 血流をよくします。
まずは、手をぶらぶらしてください

では、両ひじを肩の高さまであげて
肩の根元からひじで円をえがくように
ゆっくり後ろにまわします。
2回大きくまわしたら
今度は反対
前に大きくまわします。
これも2回ゆっくりとまわします。

最後に目を閉じて、左右2回ずつゆっくりと首を回しまーす。
右に一回～～二回～～
反対～～一回～～二回～～

はい どうですか？スッキリしましたか？`,

    fastViewing: `【速く見る】パラパラの方向け
では、次は速く見る
今までにない速度を体感して 高速スピードになれていきましょう

では○○さんは パラパラなので ギリギリ文字が見えるパラパラ
○○さんのペースでやっていってもらいたいと思います
では、6秒間いきまーす よーいスタート
はーい ありがとうございまーす
ご記入お願いします

次は超高速
文字かなにかわからないくらいのスピードでいきましょう
では、よーい スタート
はーい ありがとうございまーす
ご記入してください

では3回目は見え方の違いを感じてもらいたいので
１回目と同じように日本語がギリギリ分かるパラパラで
では6秒間で どれくらい見えるのかやっていきましょう
よーい スタート
はーい ありがとうございまーす

どうでしたか？
1回目と比べて3回目
違いを感じましたか？

※パラパラで慣れるまでは1回目から3回目までスピードをあげていく`,

    finalMeasurement: `【最終計測】
最終計測いきたいと思います。成果を確認していきましょう

では、15秒間計測をします。
よーいスタート
。。。
はーいストップです。

では計算してください。
最後四倍するのを忘れないようにしてください。
では文字数を書いてください。`,

    impression: `【感想】
ではそのままこのレッスン、45分の気づき
感想を書いてください。

今日感じたこと思ったことを書いてください。
文章でなくてもいいですし、
イラストでもかまいません。

ではかけたら
文字数の発表と感想のシェアをお願いします。

では、○○さん
「・・・」
どんな感じですか？
「・・・」

日常の気づき？
記録用紙を見せてもらう
次回の予約の確認`,

    closing: `【終わりの挨拶】
ありがとうございます。
ということで本日のレッスンを終了します。
ありがとうございました。

※必ず次回のレッスンの予約をする（レッスン開始前には次のレッスンが予約できているかを確認しておく）`
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <audio ref={speedListeningRef} loop>
        <source src="/audio/速聴音源.mp3" type="audio/mpeg" />
      </audio>

      {/* ヘッダー */}
      <header className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">速読インストラクター専用アプリ</h1>
          <div className="text-xl font-mono">
            {currentTime.toLocaleTimeString('ja-JP')}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
        
        {/* 左カラム：レッスン台本 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-lg font-semibold">レッスン台本</h2>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={prevScript}
                  disabled={currentScriptIndex === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium">{sectionTitles[currentScriptIndex]} ({currentScriptIndex + 1}/{scriptSections.length})</span>
                <button
                  onClick={nextScript}
                  disabled={currentScriptIndex === scriptSections.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              className="flex-1 overflow-y-auto focus:outline-none"
              tabIndex={0}
              onWheel={(e) => {
                e.preventDefault();
                if (e.deltaY > 0) {
                  nextScript();
                } else {
                  prevScript();
                }
              }}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed"
                   dangerouslySetInnerHTML={{
                     __html: formatScript(lessonScript[scriptSection as keyof typeof lessonScript] || '')
                   }}
              />
            </div>
          </div>
        </div>

        {/* 右カラム：操作パネル */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* タイマー */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">タイマー</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-mono mb-4">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
              <div className="flex justify-center gap-1 mb-3">
                <button
                  onClick={() => setTimerPreset(600)}
                  className={`px-2 py-1 text-xs rounded ${timer.preset === 600 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  10分
                </button>
                <button
                  onClick={() => setTimerPreset(60)}
                  className={`px-2 py-1 text-xs rounded ${timer.preset === 60 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  1分
                </button>
                <button
                  onClick={() => setTimerPreset(6)}
                  className={`px-2 py-1 text-xs rounded ${timer.preset === 6 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  6秒
                </button>
              </div>
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={startTimer}
                  disabled={timer.isRunning}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  開始
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!timer.isRunning}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  一時停止
                </button>
                <button
                  onClick={stopTimer}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  リセット
                </button>
              </div>
              <div className="text-sm">
                <label className="block mb-2">ベル音量</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={timerBellVolume}
                  onChange={(e) => setTimerBellVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{Math.round(timerBellVolume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* 速聴制御 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-5 h-5" />
              <h3 className="font-semibold">速聴制御</h3>
            </div>
            <button
              onClick={toggleSpeedListening}
              className={`w-full mb-3 px-4 py-2 rounded flex items-center justify-center gap-2 ${
                isSpeedListeningPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSpeedListeningPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSpeedListeningPlaying ? '停止' : '再生'}
            </button>
            <div>
              <label className="block mb-2 text-sm">音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={speedListeningVolume}
                onChange={(e) => setSpeedListeningVolume(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{Math.round(speedListeningVolume * 100)}%</span>
            </div>
          </div>

          {/* AIトークテーマ生成 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">トークテーマ</h3>
            </div>
            <button
              onClick={generateAITopics}
              className="w-full mb-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              5つのテーマを生成
            </button>
            {aiTopics.length > 0 && (
              <div className="space-y-2">
                {aiTopics.map((topic, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded p-2">
                    <p className="text-sm font-medium text-purple-800">{index + 1}. {topic}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 生徒管理 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold">生徒一覧</h3>
            </div>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-2">
                  <span className="text-sm w-4">{student.id}.</span>
                  <input
                    type="text"
                    placeholder="生徒名"
                    value={student.name}
                    onChange={(e) => updateStudentName(student.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
