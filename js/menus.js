const socialMedia = (term) => {
  return [
    () => term.write("\n\x1b[37;1mGitHub:    https://github.com/DannyZolp\r\n"),
    () =>
      term.write("\x1b[34;1mLinkedIn:  https://linkedin.com/in/DannyZolp\r\n"),
    () =>
      term.write("\x1b[95;1mInstagram: https://instagram.com/DannyZolp\r\n\n"),
    () => term.write("\x1b[37mMain Menu> "),
  ];
};

const resume = async (term) => {
  const resume = await (await fetch("/resume.json")).json();
  return [
    () =>
      term.write("\x1b[37;1m" + " ".repeat(20) + resume.basics.name + "\r\n\n"),
    () =>
      term.write(
        "\x1b[0m    " +
          resume.basics.location +
          " - " +
          resume.basics.email +
          " - " +
          resume.basics.phone +
          "\r\n\n"
      ),
    () => term.write(" ".repeat(20) + "\x1b[1mExperience:\r\n\n\x1b[0m"),
    ...resume.sections.experience.items.map((e) => {
      return () =>
        term.write(
          e.company +
            " ".repeat(40 - e.company.length) +
            e.date +
            "\r\n" +
            e.position +
            "\r\n\n"
        );
    }),
    () => term.write(" ".repeat(20) + "\x1b[1mEducation:\r\n\n\x1b[0m"),
    ...resume.sections.education.items.map((e) => {
      return () =>
        term.write(
          e.institution +
            " ".repeat(40 - e.institution.length) +
            e.date +
            "\r\n" +
            e.studyType +
            "\r\n" +
            e.area +
            "\r\n\n"
        );
    }),
    () => term.write(" ".repeat(20) + "\x1b[1mVolunteering:\r\n\n\x1b[0m"),
    ...resume.sections.volunteer.items.map((e) => {
      return () =>
        term.write(
          e.organization +
            " ".repeat(40 - e.organization.length) +
            e.date +
            "\r\n" +
            e.position +
            "\r\n\n"
        );
    }),
  ];
};

const resumeMenu = (term) => {
  return [
    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n"),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () =>
      term.write(
        "   |        \x1b[1mP - View PDF" +
          " ".repeat(24) +
          "T - View as Text                   |\r\n"
      ),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n\n"),
    () => term.write("Resume> "),
  ];
};

const guestbookMenu = (term) => {
  return [
    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n"),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () =>
      term.write(
        "   |        \x1b[1mV - View Guestbook" +
          " ".repeat(20) +
          "A - Add to Guestbook             |\r\n"
      ),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n\n"),
    () => term.write("Guestbook> "),
  ];
};

const guestbookPage = (term, entries) => {
  return entries.map((e) => {
    return () =>
      term.write("    [" + e.date + "]  " + e.name + ": " + e.message + "\r\n");
  });
};

const header = (term) => {
  return [
    () => term.write("\n"),

    () =>
      term.write(
        "\x1b[36;1m      +++++>.                                           \x1b[35;1m<<<<<<<          //\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m     .(     (_  .>=>>.<- <.<++<_  <.<<<<_ ..     <        \x1b[35;1m_/<  _.<<<.   (  <_-<><_\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m     ()      (>.(    (( .(<    (  (/    (  (   _(        \x1b[35;1m</   /<    \\) .( /(     ()\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m     (-     .( (>     /( (/    .( ((     (  () /)       \x1b[35;1m.(    (/     _( (< (      /(\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m    )(   _.+/  (\\   _/(> (     (/ (-    ()   ((/      \x1b[35;1m_/<     (<    .(  ( .(\\   _<)\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m    \\<<<(\\       \\<<\\ <  <     <  <     -    (<       \x1b[35;1m-------    --     - (> ---\n\r"
      ),
    () =>
      term.write(
        "\x1b[36;1m                                           _(                             \x1b[35;1m(\r\n\n"
      ),

    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n"),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () =>
      term.write(
        "   |        \x1b[1mS - Social Medias" +
          " ".repeat(20) +
          "R - Get Resume                    |\r\n"
      ),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () =>
      term.write(
        "   |        \x1b[1mG - Access Guestbook" +
          " ".repeat(17) +
          "P - Page Sysop                    |\r\n"
      ),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () =>
      term.write(
        "   |        \x1b[1mB - Navigate back to Main Menu" +
          " ".repeat(7) +
          "Q - Quit                          |\r\n"
      ),
    () => term.write("   |" + " ".repeat(79) + "|\r\n"),
    () => term.write("\x1b[37m    " + "=".repeat(79) + "\r\n\n"),
    () => term.write("Main Menu> "),
  ];
};
