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
    'preparation', 'start', 'measurement', 'oneminMeasurement', 'eyeTraining1', 'eyeTraining2', 'eyeTraining3',
    'breathing1', 'breathing2', 'viewing', 'stretch', 'fastViewing',
    'finalMeasurement', 'impression'
  ];

  const sectionTitles = [
    '準備', 'スタート', '自己紹介', '1分計測', '眼筋①左右', '眼筋②上下', '眼筋③遠近・シェア',
    '呼吸法①説明', '呼吸法②実践', '眺める', 'ストレッチ', '速く見る',
    '最終計測', 'シェア'
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
            // 自動リセット: プリセット値に戻す
            const resetMinutes = Math.floor(prev.preset / 60);
            const resetSeconds = prev.preset % 60;
            return {
              minutes: resetMinutes,
              seconds: resetSeconds,
              isRunning: false,
              preset: prev.preset
            };
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
    const audio = new Audio('/audio/alarm.mp3');
    audio.volume = timerBellVolume;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const formatScript = (text: string) => {
    // 現在の日時を取得してフォーマット
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dateTimeStr = `${month}月${day}日${hours}時${minutes}分`;

    return text
      // 日付時間の自動挿入
      .replace(/__DATETIME__/g, dateTimeStr)
      // ①②③④⑤⑥タイトルを大きく太字に
      .replace(/^[①②③④⑤⑥⑦⑧⑨⑩](.+)$/gm, '<div class="text-xl font-bold text-black mb-3 mt-2">$&</div>')
      // 【タイトル】行を先に処理（改行含めて1つのdivに）
      .replace(/^【([^】]+)】\n＜([^＞]+)＞/gm, '<div class="text-base font-bold text-black mb-2">【$1】</div><div class="text-xl font-bold text-red-600 my-3">＜$2＞</div>')
      // 残りの【タイトル】を処理
      .replace(/^【([^】]+)】/gm, '<div class="text-base font-bold text-black mb-2 mt-2">【$1】</div>')
      // ＜＞内のキーワードを大きく強調（赤字）
      .replace(/＜([^＞]+)＞/g, '<div class="text-xl font-bold text-red-600 my-3">＜$1＞</div>')
      // ◆小見出しを太字に
      .replace(/◆([^\n]+)/g, '<div class="text-lg font-semibold text-green-600 mb-2 mt-3">◆$1</div>')
      // ●中見出しを太字に
      .replace(/●([^\n]+)/g, '<div class="text-base font-semibold text-purple-600 mb-1 mt-2">●$1</div>')
      // 改行を<br>に変換
      .replace(/\n/g, '<br>')
      // ＜＞、●の直後の<br>を削除（行間を詰める）
      .replace(/(<\/div>)<br>/g, '$1');
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
    preparation: `①　準備（30分前）
＜レッスン生を迎え入れる準備をしましょう。＞
・部屋を整える
・換気
・室温湿度
・清掃
・場や物への感謝

●レッスンに必要なものの準備
・レッスン本
・速聴
・ZOOMの背景一式
・速聴の音量
・Wi-Fi環境
・充電
・画角
・必要物品
・室温の確認

●各受講生様の履歴確認
・氏名
・ニックネーム
・受講回数
・前回の文字数
・見幅
・感想
・インストラクター所見
・次回予約の有無

●自分を整える
・呼吸法・ストレッチ・瞑想など
M・VPの意識
・意図セット
・インストラクター身だしなみ

●明るくお出迎えする
・場を感じる
・常に心遣い
・受講生様への感謝
・受講生さん同士が交流しやすい場づくり
・一人にしない`,

    start: `②レッスン開始

●持ち物確認
・レッスン本
・記録用紙
・筆記用具
・電卓
・飲み物
・速聴の大きさ
・画面：手元が映るように`,

    measurement: `③スタート

では、__DATETIME__のレッスンを始めさせていただきます。

インストラクター養成の〇〇こと、〇〇〇〇です。
よろしくお願いします。

ではまず、自己紹介をお願いします

・お名前
・ニックネーム
・今回の受講回数
・前回の最終文字数
・今の気分をお願いします。（レッスンを始めたきっかけ等でも可）

では、今日もレッスン、楽しくやっていきましょう！！！
よろしくお願いします。`,

    oneminMeasurement: `④1分計測
では、早速１分間の計測からいきましょう。
自分の現在地を知っていきましょう！！

〇〇さんは　見幅は〇〇ですね。
（24回目までは見幅の指示はこちらから、24回超えたら見幅を確認してもOK)

レッスン本の16ページを開いて準備して頂いて
1分間で今の状態を知っていきましょう

では、よ～いスタート

……

はい、ありがとうございます。
文字数の計算をしてください

～計算と記入の確認～


・文字数のシェアをお願いします
・どんな感じでしたか？
・45分後どうなっていたいですか？


では、それを目指して45分間、やっていきましょう

`,

    eyeTraining1: `⑤眼筋トレーニング（左右）

次は眼筋トレーニングです。
目の筋肉のストレッチとトレーニングをしていきます！

◆左右に動かすトレーニング
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
目の中に小川や滝が流れてるのをイメージをして、<span className="text-red-600 font-bold">目に酸素と潤いを</span>戻していきます。

◆左右の計測
では、目を開けて 左右の計測をします
6秒間計 一往復で一カウント
何回できるかカウントしてください。
ではにっこりと、<span className="text-red-600 font-bold">口角を上げて笑顔で</span>！！

よーい スタート
はーい ありがとうございまーす

回数を記入して下さい。`,

    eyeTraining2: `⑤-2　眼筋トレーニング（上下）
次は上下のトレーニングです。

◆上下を動かすトレーニング
おでこの辺りとお腹の前に指をおいて下さい
顔は正面を向いたまま

まず、上の指を見ます。
どんどん指を天井の方に遠ざけ、目で追っていきます。
目の下側の筋肉が気持ちよく伸ばされている感じです

では、瞬きをして
下側の指を見ます。
指を床の方に遠ざけて
まぶたの上の筋肉が気持ち良く伸ばされてるのを感じていきまーす
もし見にくければ　指を少し前の方にだしてもらうと見やすいです

はい、瞬きして上でーす
はい、瞬きして下でーす

では、手を下ろして目を閉じて下さい。
深呼吸してゆったりリラックスして下さい。
まぶたの裏側に小川や滝が流れてるのをイメージをして、<span className="text-red-600 font-bold">目に酸素と潤いを</span>戻していきます。




◆上下の計測
では、目を開けて 上下の計測をします
6秒間計 一往復で一カウント
何回できるかカウントしてください。
ではにっこりと、<span className="text-red-600 font-bold">口角を上げて笑顔で</span>！！

よーい スタート
はーい ありがとうございまーす

回数を記入して下さい。




`,

    eyeTraining3: `⑤-3　眼筋トレーニング（遠近・シェア）
次は遠近のトレーニングです。

◆遠近を動かすトレーニング
鼻先15から20cmに、人指し指を立てます
その遠く延長線上に目標物を決めて下さい
目の前の指に焦点を合わせます
周りの景色がぼやけている感じ

そして、瞬きして
遠くの目標物に焦点を合わせます
指がぼやけてる感じですね

では、手前の指　遠く　手前　遠く

では、手を下ろして目を閉じて
深呼吸してゆったりリラックスして下さい。
まぶたの裏側に小川や滝が流れてるのをイメージをして、<span className="text-red-600 font-bold">目に酸素と潤いを</span>戻していきます。



◆遠近の計測
では、目を開けて 遠近の計測をします
6秒間計 一往復で一カウント
何回できるかカウントしてください。
ではにっこりと、<span className="text-red-600 font-bold">口角を上げて笑顔で</span>！！

よーい スタート
はーい ありがとうございまーす

回数を記入して下さい。

◆シェア
それでは
それぞれの回数のシェアをお願いします
まずは○○さんから
「・・・」
どんな感じでしたか？
「・・・」`,

    breathing1: `⑦呼吸法

それでは体をリラックスさせるために呼吸法をやっていきます。

●選択
椅子に座ってやるか、寝てやるか？
どうしますか？


●姿勢作り
まずは姿勢を作りましょう！

＜座位の人＞
背筋をピンと伸ばして
椅子に浅めに腰かけて下さい。

足は肩幅に開きます。
足の裏をピタッと床につけて
大地と繋がっているイメージを感じてください。

＜寝る人＞
足を延ばして、背中をしっかりと地面についてるのを感じて下さい。


●説明
これから、腹式呼吸で大きくゆっくり深呼吸しながら
お腹の3箇所（みぞおち、おへそ、丹田）にそれぞれ手を当てて、動きを感じていきます。

・呼吸は腹式呼吸
・鼻から3秒吸い
・お腹を風船のように膨らませて、
・3秒息をとめます。
・この時、体に力がはいらないようにします。
・口から10秒吐きお腹を凹ませます。

お腹が膨れたり、へこんだりする
のを、手で感じとってください。

あー今すってるなあ、はいてるなあ。
という意識に向けてください。


カウントに合わせて深呼吸してください。
苦しかったら無理しないで下さいね。
自分で調整してもOKです`,

    breathing2: `⑦-2　呼吸法（実践）

それでは
・軽く目を閉じて
（・寝ている人は足を45度に曲げてください。）
・手をみぞおちにセット
・意識は呼吸にフォーカスしましょう。

ゆっくりと、体の中の空気を全部吐き出していきます。
全部吐き出しちゃってください。

ではいきます。


＜みぞおち⇒おへそ⇒丹田＞
はいすってー1，2，3
キープして1，2，3
はいてー1，2，3，4，5，6，7，8，9，10



●回復
はい。それでは

・目を閉じたまま、
・手は膝の上において
（寝ている人は足を延ばして）
・体を楽にして自分のペースでゆっくりと深呼吸して下さい。

呼吸が整った方から
ゆっくりと目を開けて戻ってきてください。

はい、おかえりなさい。
このタイミングで、しっかり水分も摂って下さいねー

どうでしたか？



`,

    breathing3: ``,

    viewing: `⑧　眺める

次は『10分間眺める』をやっていきましょう。

眺めるでは
4つの事を並行処理をすることで感性を高め、周辺視野を広げていくトレーニングです。

（『脳のチューニング』です。 左脳と右脳のチューニングです。 左脳だけだと、本を読んでいて眠くなる、疲れる、ほかの事を考えている、結局何が書いて あったか分からない、となります。 文字を読まずに見ることをして、全脳を使うことにより、脳のバランスを整えていく事がこ の10分間の目的になります。）


・目
⇒目は文字を追って行ってください。この時に内容は読まなくていいです。ただ眺めて下さい。

・耳
⇒耳は速聴を意識して聞いてみて下さい。

・周辺視野
⇒周辺視野も意識します。時々私が手を振りますのでうんうんと頷いて下さい

・会話
⇒そして、その3つをやりながら皆さんと会話をしていきます。



●見幅の確認

一回目　一行の人は　上から下へ
二回目　二行の人は　二行を上から下へ
三回目　三行の人は　三行を上から下へ
四回目　1/3ページ　上から下
五回目　1/2ページ　上から下
六回目　1/2ページ　上から下
七回目　面をパッと見る
八回目　面をパッと見る
九回目　二面を一面として見る
十回目　持ち方をかえて　二面をパッと見る
十一回目　パラパラ


●スタート
・内容は理解せずに、見るだけでいいです。
・速聴は聞こえてますか？
・周辺視野も意識してください。
・10分間よろしくお願いします。


<span className="text-red-600 font-bold text-2xl">～スタート～</span>


では今日のテーマです。

＜10分間＞

はい、ありがとうございました。


`,





    stretch: `⑨ストレッチ

はい、じゃあ今からストレッチをしましょう！

筋肉を緩めて血流をよくしていきます。

●手首
まずは、手をぶらぶらしてください
ぶらぶらぶら～～～

●肩
では、両ひじを肩の高さまであげて
ガッツポーズを取るような感じで。

肩の根元からひじで円をえがくように
ゆっくり後ろにまわします。

2回大きくまわしたら
今度は反対
前に大きくまわします。
これも2回ゆっくりとまわします。


●首
次は首です。
目を閉じて、左右2回ずつゆっくりと首を回します。


はい　どうですか？スッキリしましたか？


`,

    fastViewing: `⑩速く見る


はい。じゃあ次は『早く見る』です！
6秒間で早く見る事をやっていきます。
今までにない速度を体感して　高速スピードになれていきましょう。


【1回目】
・パラパラの人
ギリギリ文字が見える速度でパラパラしていきましょう
かろうじて日本語ってわかる位でいいです。

・〇ページの人
読まなくていいのでどんどんめくっていきましょう。
文字が見えればOK
どんどん行きましょう

では、6秒間です。

～スタート～

はい、じゃあ記入して下さい！

【2回目】
・パラパラの人
次は超高速。文字ってわからなくてOK！
文字なのかゴミなのかわからないこれ以上ない速度で。


・〇ページの人
さっきよりも早くしてみましょう！
自分の限界に挑戦して下さい！！


では、6秒間です。

～スタート～

はい、じゃあ記入して下さい！


【3回目】
・パラパラの人
そしたら見え方の違いを比べるので、また1回目と同じくらいの速度。
ギリギリ日本語ってわかる位の速度で見え方の違いを意識していきましょう。

・〇ページの人
さっきよりも、さらにさらに早くしてみましょう！
限界突破！これ以上無理ってくらい早くしてみましょう！


では、6秒間です。

～スタート～

はい、じゃあ記入して下さい！



●感想シェア
どうでしたか？
1回目と比べて3回目
違いを感じましたか？

`,

    finalMeasurement: `⑪【最終計測】

それでは、最終計測いきたいと思います。
今日のレッスンの成果を確認していきましょう

一回本を置いて、目を閉じて。
肩の力を抜いて深呼吸しましょう！


では、15秒間計測をします。

よーいスタート


はーいストップです。


●計算～記入
では計算してください。

最後四倍するのを忘れないようにしてください。
では文字数を書いてください。

そして、今日のレッスンで気づいたことや感じたこと
イラストとかでも結構です。
感想を書いてください。


`,

    impression: `⑫シェア

ではかけたら
文字数の発表と感想のシェアをお願いします。


では、○○さん
「・・・」
どんな感じですか？
「・・・」

45分の成果、どんな感じになりましたか？

●写真撮影～終わりの挨拶
ありがとうございます。
はい、じゃあ写真撮りましょう！！

＜撮影＞

＜次回の予約の確認＞

ということで本日のレッスンを終了します。
ありがとうございました。


`,

    closing: ``
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <audio ref={speedListeningRef} loop>
        <source src="/audio/speed-listening.mp3" type="audio/mpeg" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-140px)]">
        
        {/* 左カラム：レッスン台本 */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white rounded-lg shadow-md p-3 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" />
              <h2 className="text-md font-semibold">レッスン台本</h2>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={prevScript}
                  disabled={currentScriptIndex === 0}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-xs font-medium px-2">{sectionTitles[currentScriptIndex]} ({currentScriptIndex + 1}/{scriptSections.length})</span>
                <button
                  onClick={nextScript}
                  disabled={currentScriptIndex === scriptSections.length - 1}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto focus:outline-none border border-gray-200 rounded-md p-3 bg-gray-50 max-h-[calc(100vh-200px)]">
              <div className="whitespace-pre-wrap text-base leading-relaxed"
                   dangerouslySetInnerHTML={{
                     __html: formatScript(lessonScript[scriptSection as keyof typeof lessonScript] || '')
                   }}
              />
            </div>
          </div>
        </div>

        {/* 右カラム：操作パネル */}
        <div className="lg:col-span-1 space-y-3">
          
          {/* タイマー */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <h3 className="text-md font-semibold">タイマー</h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono mb-3">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
              <div className="flex justify-center gap-1 mb-2">
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
                  onClick={() => setTimerPreset(15)}
                  className={`px-2 py-1 text-xs rounded ${timer.preset === 15 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  15秒
                </button>
                <button
                  onClick={() => setTimerPreset(6)}
                  className={`px-2 py-1 text-xs rounded ${timer.preset === 6 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  6秒
                </button>
              </div>
              <div className="flex justify-center gap-1 mb-2">
                <button
                  onClick={startTimer}
                  disabled={timer.isRunning}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                >
                  <Play className="w-3 h-3" />
                  開始
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!timer.isRunning}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                >
                  <Pause className="w-3 h-3" />
                  停止
                </button>
                <button
                  onClick={stopTimer}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                >
                  <Square className="w-3 h-3" />
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
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4" />
              <h3 className="text-md font-semibold">速聴制御</h3>
            </div>
            <button
              onClick={toggleSpeedListening}
              className={`w-full mb-2 px-3 py-2 rounded flex items-center justify-center gap-1 text-sm ${
                isSpeedListeningPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSpeedListeningPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
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
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              <h3 className="text-md font-semibold">トークテーマ</h3>
            </div>
            <button
              onClick={generateAITopics}
              className="w-full mb-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm"
            >
              5つのテーマを生成
            </button>
            {aiTopics.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {aiTopics.map((topic, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded p-2">
                    <p className="text-xs font-medium text-purple-800">{index + 1}. {topic}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 生徒管理 */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <h3 className="text-md font-semibold">生徒一覧</h3>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-2">
                  <span className="text-xs w-4">{student.id}.</span>
                  <input
                    type="text"
                    placeholder="生徒名"
                    value={student.name}
                    onChange={(e) => updateStudentName(student.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
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
