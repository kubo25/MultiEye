using System;

namespace Production_system.Classes {
    public enum ACTION_TYPE {
        PRIDAJ,
        VYMAZ,
        SPRAVA,
        OTAZKA,
    }
    public class Action {
        public ACTION_TYPE type { get; set; }
        public string text;

        public Action() { }

        public Action(string action) {
            string typeString = action.Substring(0, action.IndexOf(' ')).ToUpper();

            ACTION_TYPE type;

            Enum.TryParse(typeString, out type);

            this.type = type;

            text = action.Substring(action.IndexOf(' ') + 1);
        }
    }
}
