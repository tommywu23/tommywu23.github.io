---
layout: post
title:  "使用WPF设计自定义控件"
date:   2013-05-22 20:42:12
categories: [C#,WPF]
---
在实际工作中，WPF提供的控件并不能完全满足不同的设计需求。这时，需要我们设计自定义控件。

这里LZ总结一些自己的思路，特性如下：
*Coupling
*UITemplate
*Behaviour
*Function Package
下面举例说说在项目中我们经常用到调音台音量条，写一个自定义控件模拟调音台音量条。
自定义控件SingnalLight,实现功能,如下：
*接收来自外部的范围0~100的数值
*实时显示接收数值
*数值范围0~50显示绿色，50~85显示黄色，85~100显示红色，没有数值显示褐色
*可在父控件上拖拽该控件
首先New WPF Application Project,在Ui上放2个Button,如下：
{% highlight ruby %}
1     <Grid>
2         <StackPanel Orientation="Horizontal" VerticalAlignment="Bottom">
3             <Button Content="Start" Click="Start_Click"></Button>
4             <Button Content="Stop" Click="Stop_Click"></Button>
5         </StackPanel>
6     </Grid>
{% endhighlight %}
Start,Stop事件实现,如下:
{% highlight ruby %}
1         private void Start_Click(object sender, RoutedEventArgs e) {
2             SignalManager.Instance.Start();
3         }
4
5         private void Stop_Click(object sender, RoutedEventArgs e) {
6             SignalManager.Instance.Stop();
7         }
{% endhighlight %}
