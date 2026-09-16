; ============================================
; Inno Setup скрипт для MathJam
; ============================================

[Setup]
AppName=MathJam
AppVersion=1.0.0
AppVerName=MathJam 1.0.0
AppPublisher=Козлов Е.А.
AppPublisherURL=https://github.com/Exaynts/TermPaper2026
AppSupportURL=https://github.com/Exaynts/TermPaper2026
DefaultDirName={localappdata}\MathJam
DefaultGroupName=MathJam
DisableProgramGroupPage=yes
OutputDir=C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\output
OutputBaseFilename=MathJam_Setup
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
UninstallDisplayName=MathJam
SetupIconFile=C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\mathjam.ico
UninstallDisplayIcon={app}\mathjam.ico

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Types]
Name: "full"; Description: "Полная установка (с демонстрационными курсами)"
Name: "minimal"; Description: "Минимальная установка (пустая база данных)"
Name: "custom"; Description: "Выборочная установка"; Flags: iscustom

[Components]
Name: "demo"; Description: "Установить демонстрационную базу с курсами и уроками"; Types: full

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительно:"

[Files]
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\python\*"; DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\mathjam.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\demo\db.sqlite3"; DestDir: "{app}\demo"; Flags: ignoreversion; Components: demo
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\demo\media\*"; DestDir: "{app}\demo\media"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: demo
Source: "C:\Users\Jamushka\PycharmProjects\CourseWork2026\installer\demo\lessons\*"; DestDir: "{app}\demo\lessons"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: demo

[Icons]
Name: "{group}\MathJam"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\mathjam.ico"
Name: "{group}\Удалить MathJam"; Filename: "{uninstallexe}"; IconFilename: "{app}\mathjam.ico"
Name: "{userdesktop}\MathJam"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\mathjam.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\start.bat"; Description: "Запустить MathJam"; Flags: postinstall nowait skipifsilent shellexec

[UninstallDelete]
Type: filesandordirs; Name: "{app}\backend\db.sqlite3"
Type: filesandordirs; Name: "{app}\backend\media"
Type: filesandordirs; Name: "{app}\backend\staticfiles"
Type: files; Name: "{app}\backend\.env"
Type: filesandordirs; Name: "{app}\backend\__pycache__"
Type: filesandordirs; Name: "{app}\demo"