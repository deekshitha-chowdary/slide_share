import Typewriter from 'typewriter-effect';

const TypingAnimation = () => {
  return (
    <div className="text-lg text-muted-foreground mb-8 h-8">
      <Typewriter
        options={{
          strings: [
            "Workshops. Seminars. Hackathons.",
            "Learn. Build. Grow.",
            "Upload & Present Instantly.",
            "Showcase Your Work Online.",
          ],
          autoStart: true,
          loop: true,
          delay: 50,
          deleteSpeed: 30,
        }}
      />
    </div>
  );
};

export default TypingAnimation;