using System.Collections.Generic;

namespace Production_system.Classes {
    public class Rule {
        public string name { get; set; }
        public List<string> conditions { get; set; }
        public List<Action> actions { get; set; }

        public Rule() { }

        public Rule(string rule) {
            string[] list = rule.Split('\n');
            name = list[0].Substring(list[0].IndexOf(' ') + 1);

            conditions = new List<string>();
            actions = new List<Action>();

            foreach(string condition in list[1].Substring(3).Split(';')) {
                conditions.Add(condition);
            }

            foreach (string action in list[2].Substring(6).Split(';')) {
                actions.Add(new Action(action));
            }
        }
    }
}
