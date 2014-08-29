---
layout: post
title:  "使用WPF设计自定义控件"
date:   2013-05-22 20:42:12
categories: [C#,WPF]
---
> 在实际工作中，WPF提供的控件并不能完全满足不同的设计需求。这时，需要我们设计自定义控件。

这里LZ总结一些自己的思路，特性如下：

* Coupling

* UITemplate

* Behaviour

* Function Package

> 下面举例说说在项目中我们经常用到调音台音量条，写一个自定义控件模拟调音台音量条。
自定义控件SingnalLight,实现功能,如下：

* 接收来自外部的范围0~100的数值

* 实时显示接收数值

* 数值范围0~50显示绿色，50~85显示黄色，85~100显示红色，没有数值显示褐色

* 可在父控件上拖拽该控件

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
这里创建一个SignalManager类，在Start时开启一个计时器，每隔1秒生成一个0~100的随机数，并作为模拟数值输出。
SignalManager类代码：
{% highlight ruby %}
1 namespace SignalLightDemo.Business {
 2     public class SignalManager : DependencyObject {
 3         public static SignalManager Instance { get { return instance; } }
 4
 5         public int RandomA {
 6             get { return (int)GetValue(RandomAProperty); }
 7             set { SetValue(RandomAProperty, value); }
 8         }
 9
10         SignalManager() {
11             InitializationTimer();
12         }
13
14         public void Start() {
15             if (!timerA.Enabled) timerA.Start();
16         }
17
18         public void Stop() {
19             if (timerA.Enabled) timerA.Stop();
20         }
21
22         private void InitializationTimer() {
23             timerA = new Timer();
24             timerA.Interval = INTERVAL;
25             timerA.Elapsed += timerA_Elapsed;
26         }
27
28         void timerA_Elapsed(object sender, ElapsedEventArgs e) {
29             this.Dispatcher.BeginInvoke(new Action(() => {
30                 RandomA = a.Next(MAX_VALUE);
31             }));
32         }
33
34         public static readonly DependencyProperty RandomAProperty =
35             DependencyProperty.Register("RandomA", typeof(int), typeof(SignalManager), new PropertyMetadata(0));
36
37         private Random a = new Random((int)DateTime.Now.Ticks);
38         private const int MAX_VALUE = 100;
39         private const double INTERVAL = 1000;
40         private Timer timerA;
41         private static SignalManager instance = new SignalManager();
42     }
43 }
{% endhighlight %}
下面来重点：

1. 创建自定义控件SingnalLight,ValueA为接受外部数值的属性,代码如下：
{% highlight ruby %}
 1     public class SingnalLight : ContentControl {
 2         public int ValueA {
 3             get { return (int)GetValue(ValueAProperty); }
 4             set { SetValue(ValueAProperty, value); }
 5         }
 6
 7
 8         public SingnalLight() {
 9             this.AllowDrop = true;
10         }
11
12
13         static SingnalLight() {
14             DefaultStyleKeyProperty.OverrideMetadata(typeof(SingnalLight), new FrameworkPropertyMetadata(typeof(SingnalLight)));
15         }
16
17
18     }
{% endhighlight %}
2.复写控件UITemplate
{% highlight ruby %}
1  <Style TargetType="{x:Type control:SingnalLight}">
2         <Setter Property="RenderTransform">
3             <Setter.Value>
4                 <TranslateTransform X="{Binding Path=X,RelativeSource={RelativeSource AncestorType={x:Type control:SingnalLight}}}"
5                                     Y="{Binding Path=Y,RelativeSource={RelativeSource AncestorType={x:Type control:SingnalLight}}}"/>
6             </Setter.Value>
7         </Setter>
8         <Setter Property="Template">
9             <Setter.Value>
10                 <ControlTemplate>
11                     <ControlTemplate.Resources>
12                         <control:SingnalLightStatusConverter x:Key="colorconverter"></control:SingnalLightStatusConverter>
13                         <control:SingnalLightValueConverter x:Key="valueconverter"></control:SingnalLightValueConverter>
14                     </ControlTemplate.Resources>
15                     <StackPanel>
16                         <TextBlock Text="{Binding Path=ValueA,RelativeSource={RelativeSource AncestorType={x:Type control:SingnalLight}}}"></TextBlock>
17                         <TextBlock Text="100"></TextBlock>
18                         <Border
19                             x:Name="bd1"
20                             Height="{Binding Path=LightHeight,RelativeSource={RelativeSource AncestorType={x:Type control:SingnalLight}}}"
21                             SnapsToDevicePixels="True"
22                             BorderBrush="Black" BorderThickness="1" Background="Transparent">
23                             <Rectangle Fill="{Binding Path=ValueA,
24                                                       RelativeSource={RelativeSource AncestorType={x:Type control:SingnalLight}},
25                                                       Converter={StaticResource ResourceKey=colorconverter}}"
26                                        VerticalAlignment="Bottom">
27                                 <Rectangle.Height>
28                                     <MultiBinding Converter="{StaticResource ResourceKey=valueconverter}">
29                                         <Binding Path="ValueA" RelativeSource="{RelativeSource AncestorType={x:Type control:SingnalLight}}"></Binding>
30                                         <Binding Path="Height" ElementName="bd1"></Binding>
31                                     </MultiBinding>
32                                 </Rectangle.Height>
33                             </Rectangle>
34                         </Border>
35                         <TextBlock Text="0"></TextBlock>
36                     </StackPanel>
37                 </ControlTemplate>
38             </Setter.Value>
39         </Setter>
40     </Style>
{% endhighlight %}
