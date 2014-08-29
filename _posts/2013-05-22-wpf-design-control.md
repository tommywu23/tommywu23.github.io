---
layout: post
title:  "使用WPF设计自定义控件"
date:   2013-05-22 20:42:12
categories: [C#,WPF]
---
  在实际工作中，WPF提供的控件并不能完全满足不同的设计需求。这时，需要我们设计自定义控件。

这里LZ总结一些自己的思路，特性如下：

* Coupling

* UITemplate

* Behaviour

* Function Package

  下面举例说说在项目中我们经常用到调音台音量条，写一个自定义控件模拟调音台音量条。
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
3.接受值判断，SingnalLight通过实现IValueConverter和Override Arrange & Measure Methods，实现了UI呈现的绑定：
{% highlight ruby %}
 1     public class SingnalLightStatusConverter : IValueConverter {
 2         public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
 3             SolidColorBrush result = Brushes.Transparent;
 4             if (value.GetType() == typeof(int)) {
 5                 var color = System.Convert.ToInt32(value);
 6                 if (color < 50) result = Brushes.Green;
 7                 else if (color < 85 && color >= 50) result = Brushes.Yellow;
 8                 else if (color <= 100 && color >= 85) result = Brushes.Red;
 9                 else result = Brushes.Gray;
10             }
11             return result;
12         }
13
14         public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
15             throw new NotImplementedException();
16         }
17     }
18
19     public class SingnalLightValueConverter : IMultiValueConverter {
20         public object Convert(object[] values, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
21             double result = 0;
22             if (values[0].GetType() == typeof(int) && values[1].GetType() == typeof(double)) {
23                 result = (double)values[1] / 100 * System.Convert.ToDouble(values[0]);
24             }
25             return result;
26         }
27
28         public object[] ConvertBack(object value, Type[] targetTypes, object parameter, System.Globalization.CultureInfo culture) {
29             throw new NotImplementedException();
30         }
31     }
{% endhighlight %}
{% highlight ruby %}
1         protected override Size MeasureOverride(Size constraint) {
2             if (ActualHeight > 0) LightHeight = ActualHeight * .7;
3             return base.MeasureOverride(constraint);
4         }
5
6         protected override Size ArrangeOverride(Size arrangeBounds) {
7             return base.ArrangeOverride(arrangeBounds);
8         }
{% endhighlight %}
4.控件支持拖拽，覆写MouseDown,MouseMove,MouseUp方法。这样写的好处是，如果在父控件的事件中实现Drag，父控件如果有多个对象，这样逻辑会十分混乱。
{% highlight ruby %}
1         protected override void OnMouseMove(MouseEventArgs e) {
 2             base.OnMouseMove(e);
 3             if (e.LeftButton == MouseButtonState.Pressed) {
 4                 _currentPoint = e.GetPosition(this);
 5                 X += _currentPoint.X - _startPoint.X;
 6                 Y += _currentPoint.Y - _startPoint.Y;
 7             }
 8         }
 9
10         protected override void OnMouseDown(MouseButtonEventArgs e) {
11             base.OnMouseDown(e);
12             _startPoint = e.GetPosition(this);
13             this.CaptureMouse();
14         }
15
16         protected override void OnMouseUp(MouseButtonEventArgs e) {
17             base.OnMouseUp(e);
18             this.ReleaseMouseCapture();
19         }
{% endhighlight %}
SingnalLight完整代码：
{% highlight ruby %}
 1 using System;
  2 using System.Collections.Generic;
  3 using System.Linq;
  4 using System.Text;
  5 using System.Threading.Tasks;
  6 using System.Windows;
  7 using System.Windows.Controls;
  8 using System.Windows.Data;
  9 using System.Windows.Input;
 10 using System.Windows.Media;
 11
 12 namespace SignalLightDemo.Control {
 13     public class SingnalLight : ContentControl {
 14         public int ValueA {
 15             get { return (int)GetValue(ValueAProperty); }
 16             set { SetValue(ValueAProperty, value); }
 17         }
 18
 19         public double LightHeight {
 20             get { return (double)GetValue(LightHeightProperty); }
 21             set { SetValue(LightHeightProperty, value); }
 22         }
 23
 24         public double X {
 25             get { return (double)GetValue(XProperty); }
 26             set { SetValue(XProperty, value); }
 27         }
 28
 29         public double Y {
 30             get { return (double)GetValue(YProperty); }
 31             set { SetValue(YProperty, value); }
 32         }
 33
 34         public SingnalLight() {
 35             this.AllowDrop = true;
 36         }
 37
 38         protected override void OnMouseMove(MouseEventArgs e) {
 39             base.OnMouseMove(e);
 40             if (e.LeftButton == MouseButtonState.Pressed) {
 41                 _currentPoint = e.GetPosition(this);
 42                 X += _currentPoint.X - _startPoint.X;
 43                 Y += _currentPoint.Y - _startPoint.Y;
 44             }
 45         }
 46
 47         protected override void OnMouseDown(MouseButtonEventArgs e) {
 48             base.OnMouseDown(e);
 49             _startPoint = e.GetPosition(this);
 50             this.CaptureMouse();
 51         }
 52
 53         protected override void OnMouseUp(MouseButtonEventArgs e) {
 54             base.OnMouseUp(e);
 55             this.ReleaseMouseCapture();
 56         }
 57
 58         protected override Size MeasureOverride(Size constraint) {
 59             if (ActualHeight > 0) LightHeight = ActualHeight * .7;
 60             return base.MeasureOverride(constraint);
 61         }
 62
 63         protected override Size ArrangeOverride(Size arrangeBounds) {
 64             return base.ArrangeOverride(arrangeBounds);
 65         }
 66
 67         static SingnalLight() {
 68             DefaultStyleKeyProperty.OverrideMetadata(typeof(SingnalLight), new FrameworkPropertyMetadata(typeof(SingnalLight)));
 69         }
 70
 71         public static readonly DependencyProperty LightHeightProperty =
 72             DependencyProperty.Register("LightHeight", typeof(double), typeof(SingnalLight), new PropertyMetadata((double)0));
 73
 74         public static readonly DependencyProperty ValueAProperty =
 75             DependencyProperty.Register("ValueA", typeof(int), typeof(SingnalLight), new PropertyMetadata(0));
 76
 77         public static readonly DependencyProperty XProperty =
 78             DependencyProperty.Register("X", typeof(double), typeof(SingnalLight), new PropertyMetadata((double)0));
 79
 80         public static readonly DependencyProperty YProperty =
 81             DependencyProperty.Register("Y", typeof(double), typeof(SingnalLight), new PropertyMetadata((double)0));
 82
 83         private Point _startPoint;
 84         private Point _currentPoint;
 85     }
 86
 87     public class SingnalLightStatusConverter : IValueConverter {
 88         public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
 89             SolidColorBrush result = Brushes.Transparent;
 90             if (value.GetType() == typeof(int)) {
 91                 var color = System.Convert.ToInt32(value);
 92                 if (color < 50) result = Brushes.Green;
 93                 else if (color < 85 && color >= 50) result = Brushes.Yellow;
 94                 else if (color <= 100 && color >= 85) result = Brushes.Red;
 95                 else result = Brushes.Gray;
 96             }
 97             return result;
 98         }
 99
100         public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
101             throw new NotImplementedException();
102         }
103     }
104
105     public class SingnalLightValueConverter : IMultiValueConverter {
106         public object Convert(object[] values, Type targetType, object parameter, System.Globalization.CultureInfo culture) {
107             double result = 0;
108             if (values[0].GetType() == typeof(int) && values[1].GetType() == typeof(double)) {
109                 result = (double)values[1] / 100 * System.Convert.ToDouble(values[0]);
110             }
111             return result;
112         }
113
114         public object[] ConvertBack(object value, Type[] targetTypes, object parameter, System.Globalization.CultureInfo culture) {
115             throw new NotImplementedException();
116         }
117     }
118 }
{% endhighlight %}
界面调用：
{% highlight ruby %}
1 <Window x:Class="SignalLightDemo.MainWindow"
2         xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3         xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4         xmlns:control="clr-namespace:SignalLightDemo.Control"
5         xmlns:business="clr-namespace:SignalLightDemo.Business"
6         Title="SignalLight" Height="600" Width="800">
7     <Grid>
8         <control:SingnalLight Width="50" Height="300"
9                              ValueA="{Binding Source={x:Static business:SignalManager.Instance},Path=RandomA}"></control:SingnalLight>
10         <StackPanel Orientation="Horizontal" VerticalAlignment="Bottom">
11             <Button Content="Start" Click="Start_Click"></Button>
12             <Button Content="Stop" Click="Stop_Click"></Button>
13         </StackPanel>
14     </Grid>
15 </Window>
{% endhighlight %}
