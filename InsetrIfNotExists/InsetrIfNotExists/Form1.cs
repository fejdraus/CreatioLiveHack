using System.Windows.Forms;
using static System.Net.Mime.MediaTypeNames;

namespace InsetrIfNotExists
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();

            openFileDialog1.Filter = "Text files(*.sql)|*.sql";
            saveFileDialog1.Filter = "Text files(*.sql)|*.sql";
        }

        private string Filename { get; set; }

        private void button1_Click(object sender, EventArgs e)
        {
            if (openFileDialog1.ShowDialog() == DialogResult.Cancel)
                return;
            Filename = openFileDialog1.FileName;
            textBox1.Text = Filename;
            var line = File.ReadLines(Filename).FirstOrDefault();
            if(line != null)
            {
                textBox2.Text = line.Substring(line.IndexOf("INSERT INTO ") + "INSERT INTO ".Length, line.IndexOf(" (Id,") - "INSERT INTO ".Length);
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
           string tableName = textBox2.Text;
           var list = new List<string>();
            foreach (string line in File.ReadLines(Filename))
            {
                var sqlLine = line.IndexOf("VALUES(") + 7;
                String start = line.Substring(sqlLine);
                string id = start.Substring(0, start.IndexOf(","));
                var newLine = line.Replace("VALUES(", "SELECT ").Replace(");", "") + " WHERE NOT EXISTS(SELECT * FROM " + tableName + " WHERE Id = " + id + ");";
                list.Add(newLine);
            }
            list.Add("DELETE FROM " + tableName + " WHERE ContactId IS NOT NULL;");
            File.WriteAllLines(textBox3.Text, list.Select(i => i.ToString()).ToArray(), System.Text.Encoding.UTF8);
            MessageBox.Show("Файл сконвертирован");
        }

        private void button3_Click(object sender, EventArgs e)
        {
            if (saveFileDialog1.ShowDialog() == DialogResult.Cancel)
                return;
            textBox3.Text = saveFileDialog1.FileName;
        }
    }
}