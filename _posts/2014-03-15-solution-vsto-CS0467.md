---
layout: post
title:  ".NET Warning CS0467 解决方案"
date:   2014-03-15 11:42:12
categories: [C#,VSTO,Office]
---
Warning CS0467: Ambiguity between method 'Microsoft.Office.Interop.Word._Document.Close(ref object, ref object, ref object)' and non-method 'Microsoft.Office.Interop.Word.DocumentEvents2_Event.Close'. Using method group.


类似诸如：

warning CS0467: Ambiguity between method 'Microsoft.Office.Interop.Word._Application.Quit(ref object, ref object, ref object)' and non-method 'Microsoft.Office.Interop.Word.ApplicationEvents4_Event.Quit'. Using method group.

warning CS0467: Ambiguity between method 'Microsoft.Office.Interop.Excel._Workbook.Activate()' and non-method 'Microsoft.Office.Interop.Excel.WorkbookEvents_Event.Activate'. Using method group.


解决办法:

Microsoft.Office.Interop.Word.Application 改成 Microsoft.Office.Interop.Word._Application。

[参考1]
[参考2]
[参考3]

[参考1]: http://stackoverflow.com/questions/8303969/how-to-eliminate-warning-about-ambiguity
[参考2]: http://stackoverflow.com/questions/8640594/compile-time-warning-when-using-microsoft-office-interop-word-document-close
[参考3]: http://stackoverflow.com/questions/10480119/warning-cs0467-when-using-microsoft-office-interop-word-document-close
